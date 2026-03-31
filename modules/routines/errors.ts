export class RoutineNotFoundError extends Error {
  constructor(id: string) {
    super(`Routine not found: ${id}`);
    this.name = "RoutineNotFoundError";
  }
}

export class RoutineSetNotFoundError extends Error {
  constructor(id: string) {
    super(`Routine set not found: ${id}`);
    this.name = "RoutineSetNotFoundError";
  }
}

export class UnauthorizedRoutineAccessError extends Error {
  constructor(routineId: string, userId: string) {
    super(`User ${userId} is not authorized to access routine ${routineId}`);
    this.name = "UnauthorizedRoutineAccessError";
  }
}
