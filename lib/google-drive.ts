import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { isDriveFolderId } from "./drive-folder";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const EMAIL_SCOPE = "https://www.googleapis.com/auth/userinfo.email";
export const GOOGLE_SCOPES = `${DRIVE_SCOPE} ${EMAIL_SCOPE}`;

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

export type DriveImageFile = {
  id: string;
  name: string;
  mimeType: string;
};

export function googleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/admin/google/callback`;
}

export function googleAuthUrl(params: { redirectUri: string; state: string }): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", params.state);
  return url.toString();
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as TokenResponse;
  if (!res.ok) {
    throw new Error(json.error_description || json.error || `Google token error (${res.status})`);
  }
  return json;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const json = await postToken(
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    })
  );
  if (!json.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Revoke access at https://myaccount.google.com/permissions and connect again."
    );
  }
  if (!json.access_token) {
    throw new Error("Google did not return an access token.");
  }
  return { accessToken: json.access_token, refreshToken: json.refresh_token };
}

let cachedAccess: { refreshToken: string; accessToken: string; expiresAt: number } | null = null;

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (
    cachedAccess &&
    cachedAccess.refreshToken === refreshToken &&
    Date.now() < cachedAccess.expiresAt
  ) {
    return cachedAccess.accessToken;
  }
  const json = await postToken(
    new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    })
  );
  if (!json.access_token) {
    throw new Error("Could not refresh the Google Drive access token. Reconnect Drive in Settings.");
  }
  cachedAccess = {
    refreshToken,
    accessToken: json.access_token,
    expiresAt: Date.now() + Math.max(30, (json.expires_in || 3600) - 60) * 1000,
  };
  return json.access_token;
}

export async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = (await res.json()) as { email?: string; error?: { message?: string } };
  if (!res.ok || !json.email) {
    throw new Error(json.error?.message || "Could not read the Google account email.");
  }
  return json.email;
}

export async function revokeGoogleToken(token: string): Promise<void> {
  await fetch(`${REVOKE_URL}?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }).catch(() => undefined);
}

export async function listDriveImageFiles(
  accessToken: string,
  folderId: string
): Promise<DriveImageFile[]> {
  if (!isDriveFolderId(folderId)) {
    throw new Error("That does not look like a Google Drive folder ID.");
  }

  const files: DriveImageFile[] = [];
  let pageToken = "";

  do {
    const url = new URL(DRIVE_FILES_URL);
    url.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
    url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType)");
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = (await res.json()) as {
      files?: DriveImageFile[];
      nextPageToken?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(json.error?.message || `Drive list failed (${res.status})`);
    }
    for (const file of json.files || []) {
      if (file.mimeType?.startsWith("image/")) {
        files.push(file);
      }
    }
    pageToken = json.nextPageToken || "";
  } while (pageToken);

  return files;
}

export async function downloadDriveFile(
  accessToken: string,
  fileId: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const url = new URL(`${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}`);
  url.searchParams.set("alt", "media");
  url.searchParams.set("supportsAllDrives", "true");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Could not download Drive file (${res.status})`);
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  return { bytes, contentType };
}

function encryptionKey(): Buffer {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) {
    throw new Error("GOOGLE_CLIENT_SECRET is not set.");
  }
  return scryptSync(secret, "tyler-oxford-google-drive", 32);
}

export function encryptRefreshToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptRefreshToken(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  if (buf.length < 29) {
    throw new Error("Stored Google token is invalid. Reconnect Drive in Settings.");
  }
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
