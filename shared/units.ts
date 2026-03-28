const KG_TO_LBS = 2.20462;

export function kgToLbs(kg: number): number {
  return kg * KG_TO_LBS;
}

export function lbsToKg(lbs: number): number {
  return lbs / KG_TO_LBS;
}

export function formatWeightFromKg(value: number, unit: "kg" | "lbs"): string {
  const converted = unit === "lbs" ? kgToLbs(value) : value;
  return `${Number(converted.toFixed(1))} ${unit}`;
}
