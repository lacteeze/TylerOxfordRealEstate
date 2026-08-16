import { describe, expect, it } from "vitest";
import { parseDriveFolder } from "./drive-folder";

describe("parseDriveFolder", () => {
  it("extracts an ID from a standard Drive folder URL", () => {
    expect(
      parseDriveFolder("https://drive.google.com/drive/folders/1AbCDefGhijKLmnoPQRsTUVwxYZ-12345")
    ).toEqual({
      id: "1AbCDefGhijKLmnoPQRsTUVwxYZ-12345",
      url: "https://drive.google.com/drive/folders/1AbCDefGhijKLmnoPQRsTUVwxYZ-12345",
    });
  });

  it("extracts an ID from a /u/0/folders URL with query params", () => {
    expect(
      parseDriveFolder(
        "https://drive.google.com/drive/u/0/folders/1AbCDefGhijKLmnoPQRsTUVwxYZ-12345?usp=sharing"
      )?.id
    ).toBe("1AbCDefGhijKLmnoPQRsTUVwxYZ-12345");
  });

  it("extracts an ID from an open?id= URL", () => {
    expect(parseDriveFolder("https://drive.google.com/open?id=1AbCDefGhijKLmnoPQRsTUVwxYZ")?.id).toBe(
      "1AbCDefGhijKLmnoPQRsTUVwxYZ"
    );
  });

  it("accepts a bare folder ID", () => {
    expect(parseDriveFolder("1AbCDefGhijKLmnoPQRsTUVwxYZ")?.id).toBe("1AbCDefGhijKLmnoPQRsTUVwxYZ");
  });

  it("returns null for empty or invalid input", () => {
    expect(parseDriveFolder("")).toBeNull();
    expect(parseDriveFolder("https://example.com/not-drive")).toBeNull();
    expect(parseDriveFolder("short")).toBeNull();
  });
});
