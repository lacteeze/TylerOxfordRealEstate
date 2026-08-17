import { headers } from "next/headers";

export async function publicAppOrigin(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "localhost:3001")
    .split(",")[0]
    .trim();
  const proto =
    h.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
