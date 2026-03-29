import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreference } from "@/lib/db/schema";

export type SessionDTO = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
};

export type AuthResultDTO = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type UserPreferencesDTO = {
  id: string;
  userId: string;
  unit: "kg" | "lbs";
  onboardingCompleted: boolean;
};

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

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferencesDTO> {
  const prefs = await db.query.userPreference.findFirst({
    where: eq(userPreference.userId, userId),
  });
  if (!prefs) throw new UserPreferencesNotFoundError(userId);
  return {
    id: prefs.id,
    userId: prefs.userId,
    unit: prefs.unit,
    onboardingCompleted: prefs.onboardingCompleted,
  };
}

export async function updateUserPreferences(
  userId: string,
  data: Partial<Pick<UserPreferencesDTO, "unit" | "onboardingCompleted">>,
): Promise<UserPreferencesDTO> {
  if (Object.keys(data).length === 0) {
    return getUserPreferences(userId);
  }
  const [updated] = await db
    .update(userPreference)
    .set(data)
    .where(eq(userPreference.userId, userId))
    .returning();
  if (!updated) throw new UserPreferencesNotFoundError(userId);
  return {
    id: updated.id,
    userId: updated.userId,
    unit: updated.unit,
    onboardingCompleted: updated.onboardingCompleted,
  };
}

export async function getSession(): Promise<SessionDTO | null> {
  try {
    const result = await auth.api.getSession({
      headers: await headers(),
    });
    if (!result) return null;
    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      session: {
        id: result.session.id,
        token: result.session.token,
        expiresAt: result.session.expiresAt,
      },
    };
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch {
    // Already signed out or invalid session — treat as success
  }
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthResultDTO> {
  try {
    const result = await auth.api.signInEmail({ body: input });
    if (!result.token) throw new AuthError("Sign-in did not return a token");
    return {
      token: result.token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(
      error instanceof Error ? error.message : "Sign-in failed",
    );
  }
}

export async function signUp(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResultDTO> {
  try {
    const result = await auth.api.signUpEmail({ body: input });
    if (!result.token) throw new AuthError("Sign-up did not return a token");
    return {
      token: result.token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(
      error instanceof Error ? error.message : "Sign-up failed",
    );
  }
}
