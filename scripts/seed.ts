import "dotenv/config";
import { seedExercises } from "@/modules/exercises";

async function main() {
  const result = await seedExercises();
  console.log(`Seeded ${result.seeded} exercises`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
