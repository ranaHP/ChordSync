import { describe, it, expect } from "vitest";
import fs from "node:fs";

describe("seed dataset", () => {
  it("uses Singlish and no Sinhala entries", () => {
    const src = fs.readFileSync("scripts/seed.ts", "utf8");
    expect(src.includes('"Singlish"')).toBe(true);
    expect(src.includes('"Sinhala"')).toBe(false);
  });
});
