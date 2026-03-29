export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div data-focus-mode className="p-4">
      <h1 className="text-lg font-semibold">Workout {id}</h1>
    </div>
  );
}
