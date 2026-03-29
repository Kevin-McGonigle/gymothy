import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("manifest", () => {
  it("returns a valid web app manifest", () => {
    const result = manifest();

    expect(result).toMatchObject({
      name: "Gymothy",
      short_name: "Gymothy",
      description: expect.any(String),
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#2b7a8a",
    });
  });

  it("includes required icons with correct paths and sizes", () => {
    const result = manifest();

    expect(result.icons).toEqual([
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ]);
  });
});
