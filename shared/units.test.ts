import { describe, expect, it } from "vitest";
import { formatWeightFromKg, kgToLbs, lbsToKg } from "@/shared/units";

describe("kgToLbs", () => {
  it("converts kilograms to pounds", () => {
    expect(kgToLbs(100)).toBeCloseTo(220.462);
  });

  it("returns 0 for 0 input", () => {
    expect(kgToLbs(0)).toBe(0);
  });
});

describe("lbsToKg", () => {
  it("converts pounds to kilograms", () => {
    expect(lbsToKg(220.462)).toBeCloseTo(100);
  });

  it("returns 0 for 0 input", () => {
    expect(lbsToKg(0)).toBe(0);
  });
});

describe("formatWeightFromKg", () => {
  it("formats weight in kg without conversion", () => {
    expect(formatWeightFromKg(100, "kg")).toBe("100 kg");
  });

  it("formats weight in lbs with conversion from kg", () => {
    expect(formatWeightFromKg(100, "lbs")).toBe("220.5 lbs");
  });

  it("rounds to 1 decimal place", () => {
    expect(formatWeightFromKg(33.333, "kg")).toBe("33.3 kg");
  });

  it("drops trailing zero for whole numbers", () => {
    expect(formatWeightFromKg(50, "kg")).toBe("50 kg");
  });
});
