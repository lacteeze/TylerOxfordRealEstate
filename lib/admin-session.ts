/** Preference cookie: "1" = stay signed in ~30 days, "0" = browser session. */
export const REMEMBER_COOKIE = "to-admin-remember";

/** How long the session cookie lasts when Remember me is checked. */
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

export function isRememberPref(value: string | undefined | null): boolean {
  return value !== "0";
}

export function withAuthCookieLifetime<T extends Record<string, unknown>>(
  options: T | undefined,
  remember: boolean
): T {
  const next = { ...(options ?? {}) } as T & { maxAge?: number; expires?: unknown };
  delete next.expires;
  if (typeof next.maxAge === "number" && next.maxAge <= 0) {
    return next as T;
  }
  if (remember) {
    next.maxAge = REMEMBER_MAX_AGE;
  } else {
    delete next.maxAge;
  }
  return next as T;
}

/** Only allow in-app admin paths as post-auth redirects. */
export function safeAdminNextPath(
  raw: string | null | undefined,
  fallback = "/admin"
): string {
  if (!raw) return fallback;
  let path = raw.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path);
      path = `${url.pathname}${url.search}`;
    }
  } catch {
    return fallback;
  }
  if (!path.startsWith("/admin") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  if (path.startsWith("/admin/auth/callback")) {
    return fallback;
  }
  return path;
}

export function serializeBrowserCookie(
  name: string,
  value: string,
  options?: {
    path?: string;
    maxAge?: number;
    sameSite?: true | false | "lax" | "strict" | "none";
    secure?: boolean;
    expires?: Date;
  }
): string {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options?.path ?? "/"}`);
  if (typeof options?.maxAge === "number") {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  if (options?.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  const sameSite = options?.sameSite;
  if (sameSite === true || sameSite === "strict") parts.push("SameSite=Strict");
  else if (sameSite === "lax") parts.push("SameSite=Lax");
  else if (sameSite === "none") parts.push("SameSite=None");
  if (options?.secure) parts.push("Secure");
  return parts.join("; ");
}

export function rememberPrefFromDocumentCookie(cookieHeader: string): boolean {
  const match = cookieHeader.split("; ").find((part) => part.startsWith(`${REMEMBER_COOKIE}=`));
  return isRememberPref(match?.slice(REMEMBER_COOKIE.length + 1));
}
