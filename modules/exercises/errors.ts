export class ExerciseNotFoundError extends Error {
  constructor(id: string) {
    super(`Exercise not found: ${id}`);
    this.name = "ExerciseNotFoundError";
  }
}
