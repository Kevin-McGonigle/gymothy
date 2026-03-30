export class UserPreferencesNotFoundError extends Error {
  constructor(userId: string) {
    super(`UserPreferencesNotFoundError: no preferences for user ${userId}`);
    this.name = "UserPreferencesNotFoundError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
