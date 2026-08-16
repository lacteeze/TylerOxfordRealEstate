export function parseDriveFolder(input: string): { id: string; url: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) {
    return {
      id: folderMatch[1],
      url: `https://drive.google.com/drive/folders/${folderMatch[1]}`,
    };
  }

  const idParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam?.[1]) {
    return {
      id: idParam[1],
      url: `https://drive.google.com/drive/folders/${idParam[1]}`,
    };
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return {
      id: trimmed,
      url: `https://drive.google.com/drive/folders/${trimmed}`,
    };
  }

  return null;
}

export function isDriveFolderId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{10,}$/.test(id);
}
