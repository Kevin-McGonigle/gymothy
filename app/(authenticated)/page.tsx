import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth";
import { ROUTES } from "@/shared/constants";
import { HistoryEmpty } from "./_components/history-empty";

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect(ROUTES.LOGIN);

  // TODO: fetch workouts when workout module exists
  const hasWorkouts = false;

  if (!hasWorkouts) return <HistoryEmpty />;
  return <div>History content</div>;
}
