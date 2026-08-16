import {
  PACKAGES,
  SERVICES,
  SERVICE_BY_ID,
  TRAVEL_CENTS_PER_KM,
  UPGRADE_WINDOW_CENTS,
  alaCarteCents,
  isServiceId,
  type PackageDef,
  type PackageId,
  type ServiceId,
} from "./pricing";
import { travelFeeCents, travelLineName } from "./travel";

export type LineItemKind = "package" | "service" | "travel";

export interface LineItem {
  kind: LineItemKind;
  id: PackageId | ServiceId | "travel";
  name: string;
  priceCents: number;
}

export interface PriceResult {
  total: number;
  lineItems: LineItem[];
  alaCarteTotal: number;
  savings: number;
}

export interface UpgradeSuggestion {
  packageId: PackageId;
  packageName: string;
  extraCost: number;
  servicesGained: ServiceId[];
  newTotal: number;
}

function uniqueInCatalogOrder(ids: readonly string[]): ServiceId[] {
  const selected = new Set(ids.filter(isServiceId));
  return SERVICES.map((s) => s.id).filter((id) => selected.has(id));
}

function isSubset(packageServices: readonly ServiceId[], selected: ReadonlySet<ServiceId>): boolean {
  return packageServices.every((id) => selected.has(id));
}

function remainingServices(selected: readonly ServiceId[], pkg: PackageDef): ServiceId[] {
  const covered = new Set(pkg.services);
  return selected.filter((id) => !covered.has(id));
}

export function matchingPackageId(selectedServiceIds: readonly ServiceId[]): PackageId | null {
  const selected = new Set(uniqueInCatalogOrder(selectedServiceIds));
  for (const pkg of PACKAGES) {
    if (pkg.services.length !== selected.size) continue;
    if (pkg.services.every((id) => selected.has(id))) return pkg.id;
  }
  return null;
}

export function packageSavingsCents(pkg: PackageDef): number {
  return alaCarteCents(pkg.services) - pkg.priceCents;
}

/** Adds a travel line when the fee is greater than zero. Packages never absorb travel. */
export function withTravelFee(quote: PriceResult, travelCents: number): PriceResult {
  const cents = Math.max(0, Math.round(travelCents));
  if (cents <= 0) return quote;
  const excessKm = cents / TRAVEL_CENTS_PER_KM;
  return {
    ...quote,
    total: quote.total + cents,
    lineItems: [
      ...quote.lineItems,
      {
        kind: "travel",
        id: "travel",
        name: travelLineName(excessKm),
        priceCents: cents,
      },
    ],
  };
}

export function applyTravel(quote: PriceResult, distanceKm: number): PriceResult {
  return withTravelFee(quote, travelFeeCents(distanceKm));
}

export function priceCart(selectedServiceIds: ServiceId[], travelCents = 0): PriceResult {
  const selected = uniqueInCatalogOrder(selectedServiceIds);
  const selectedSet = new Set(selected);
  const alaCarteTotal = alaCarteCents(selected);

  if (selected.length === 0) {
    return withTravelFee(
      { total: 0, lineItems: [], alaCarteTotal: 0, savings: 0 },
      travelCents
    );
  }

  let bestPkg: PackageDef | null = null;
  let bestRemaining = selected;
  let bestTotal = alaCarteTotal;

  for (const pkg of PACKAGES) {
    if (!isSubset(pkg.services, selectedSet)) continue;
    const remaining = remainingServices(selected, pkg);
    const total = pkg.priceCents + alaCarteCents(remaining);
    const coversMore = pkg.services.length > (bestPkg?.services.length ?? 0);
    if (total < bestTotal || (total === bestTotal && coversMore)) {
      bestPkg = pkg;
      bestRemaining = remaining;
      bestTotal = total;
    }
  }

  const lineItems: LineItem[] = [];
  if (bestPkg) {
    lineItems.push({
      kind: "package",
      id: bestPkg.id,
      name: bestPkg.name,
      priceCents: bestPkg.priceCents,
    });
  }
  for (const id of bestRemaining) {
    const service = SERVICE_BY_ID[id];
    lineItems.push({
      kind: "service",
      id,
      name: service.name,
      priceCents: service.priceCents,
    });
  }

  return withTravelFee(
    {
      total: bestTotal,
      lineItems,
      alaCarteTotal,
      savings: alaCarteTotal - bestTotal,
    },
    travelCents
  );
}

export function suggestUpgrade(selectedServiceIds: ServiceId[]): UpgradeSuggestion | null {
  const selected = uniqueInCatalogOrder(selectedServiceIds);
  if (selected.length === 0) return null;

  const selectedSet = new Set(selected);
  const current = priceCart(selected);

  let best: (UpgradeSuggestion & { score: number }) | null = null;

  for (const pkg of PACKAGES) {
    if (isSubset(pkg.services, selectedSet)) continue;

    const leftover = remainingServices(selected, pkg);
    const newTotal = pkg.priceCents + alaCarteCents(leftover);
    const extraCost = newTotal - current.total;
    if (Math.abs(extraCost) > UPGRADE_WINDOW_CENTS) continue;

    const servicesGained = pkg.services.filter((id) => !selectedSet.has(id));
    if (servicesGained.length === 0) continue;

    // Prefer more services gained per extra dollar; free/cheaper upgrades win.
    const score =
      extraCost <= 0
        ? servicesGained.length * 1_000_000 + -extraCost
        : servicesGained.length / extraCost;

    if (!best || score > best.score) {
      best = {
        packageId: pkg.id,
        packageName: pkg.name,
        extraCost,
        servicesGained,
        newTotal,
        score,
      };
    }
  }

  if (!best) return null;
  const { score: _score, ...suggestion } = best;
  return suggestion;
}

export function applyUpgradeSelection(
  selectedServiceIds: readonly ServiceId[],
  suggestion: UpgradeSuggestion
): ServiceId[] {
  return uniqueInCatalogOrder([...selectedServiceIds, ...suggestion.servicesGained]);
}
