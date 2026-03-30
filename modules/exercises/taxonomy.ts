import { z } from "zod";

export const BODY_PARTS = [
  "upper back",
  "lower back",
  "cardio",
  "chest",
  "core",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
] as const;

export const MUSCLES = [
  // upper back
  "traps",
  "rhomboids",
  // lower back
  "lats",
  "erector spinae",
  // cardio
  "cardiovascular system",
  // chest
  "pectorals",
  "serratus anterior",
  // core
  "abs",
  "obliques",
  // lower arms
  "forearms",
  "wrist flexors",
  "wrist extensors",
  // lower legs
  "calves",
  "soleus",
  "tibialis anterior",
  // neck
  "neck",
  // shoulders
  "delts",
  "rotator cuff",
  // upper arms
  "biceps",
  "triceps",
  "brachialis",
  // upper legs
  "quads",
  "hamstrings",
  "glutes",
  "adductors",
  "abductors",
  "hip flexors",
] as const;

export const EQUIPMENTS = [
  "assisted",
  "balance board",
  "band",
  "barbell",
  "body weight",
  "bosu ball",
  "cable",
  "dumbbell",
  "elliptical machine",
  "ez barbell",
  "hammer",
  "kettlebell",
  "leverage machine",
  "medicine ball",
  "olympic barbell",
  "preacher bench",
  "resistance band",
  "rings",
  "roller",
  "rope",
  "skierg machine",
  "sled machine",
  "smith machine",
  "stability ball",
  "stationary bike",
  "stepmill machine",
  "suspension strap",
  "tire",
  "trap bar",
  "treadmill",
  "upper body ergometer",
  "weighted",
  "wheel roller",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];
export type Muscle = (typeof MUSCLES)[number];
export type Equipment = (typeof EQUIPMENTS)[number];

export const BODY_PART_MUSCLES: Record<BodyPart, readonly Muscle[]> = {
  "upper back": ["traps", "rhomboids"],
  "lower back": ["lats", "erector spinae"],
  cardio: ["cardiovascular system"],
  chest: ["pectorals", "serratus anterior"],
  core: ["abs", "obliques"],
  "lower arms": ["forearms", "wrist flexors", "wrist extensors"],
  "lower legs": ["calves", "soleus", "tibialis anterior"],
  neck: ["neck"],
  shoulders: ["delts", "rotator cuff"],
  "upper arms": ["biceps", "triceps", "brachialis"],
  "upper legs": [
    "quads",
    "hamstrings",
    "glutes",
    "adductors",
    "abductors",
    "hip flexors",
  ],
};

export const bodyPartSchema = z.enum(BODY_PARTS);
export const muscleSchema = z.enum(MUSCLES);
export const equipmentSchema = z.enum(EQUIPMENTS);
