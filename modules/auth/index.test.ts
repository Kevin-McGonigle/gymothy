import type { TestHelpers } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, userPreference } from "@/lib/db/schema";

import {
  AuthError,
  getSession,
  getUserPreferences,
  signIn,
  signOut,
  signUp,
  updateUserPreferences,
} from "./index";

let mockHeaders = new Headers();
vi.mock("next/headers", () => ({
  headers: async () => mockHeaders,
}));

let testHelpers: TestHelpers;
beforeAll(async () => {
  const ctx = await auth.$context;
  testHelpers = ctx.test;
});

describe("auth module", () => {
  describe("signUp", () => {
    it("should create a user and default preferences on sign-up", async () => {
      const result = await signUp({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.token).toBeDefined();

      // Verify user exists in DB
      const [dbUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, "test@example.com"));
      expect(dbUser).toBeDefined();

      // Verify preferences created with defaults
      const [prefs] = await db
        .select()
        .from(userPreference)
        .where(eq(userPreference.userId, dbUser.id));
      expect(prefs).toBeDefined();
      expect(prefs.unit).toBe("kg");
      expect(prefs.onboardingCompleted).toBe(false);
    });

    it("should default name to email prefix when name is omitted", async () => {
      const result = await signUp({
        email: "jane.doe@example.com",
        password: "password123",
      });

      expect(result.user.name).toBe("jane.doe");
    });

    it("should throw AuthError on duplicate email", async () => {
      await signUp({
        email: "dup@example.com",
        password: "password123",
        name: "First User",
      });

      await expect(
        signUp({
          email: "dup@example.com",
          password: "password456",
          name: "Second User",
        }),
      ).rejects.toThrow(AuthError);
    });
  });

  describe("getSession", () => {
    it("should return session for authenticated user", async () => {
      const { user: signedUpUser } = await signUp({
        email: "session@example.com",
        password: "password123",
        name: "Session User",
      });

      mockHeaders = await testHelpers.getAuthHeaders({
        userId: signedUpUser.id,
      });

      const session = await getSession();
      expect(session).not.toBeNull();
      expect(session?.user.email).toBe("session@example.com");
    });

    it("should return null for unauthenticated request", async () => {
      mockHeaders = new Headers();

      const session = await getSession();
      expect(session).toBeNull();
    });
  });

  describe("getUserPreferences", () => {
    it("should return default preferences after sign-up", async () => {
      const { user: signedUpUser } = await signUp({
        email: "prefs@example.com",
        password: "password123",
        name: "Prefs User",
      });

      const prefs = await getUserPreferences(signedUpUser.id);
      expect(prefs.userId).toBe(signedUpUser.id);
      expect(prefs.unit).toBe("kg");
      expect(prefs.onboardingCompleted).toBe(false);
    });

    it("should throw when preferences not found", async () => {
      await expect(getUserPreferences("nonexistent-id")).rejects.toThrow(
        "UserPreferencesNotFoundError",
      );
    });
  });

  describe("updateUserPreferences", () => {
    it("should update unit preference", async () => {
      const { user: signedUpUser } = await signUp({
        email: "update-prefs@example.com",
        password: "password123",
        name: "Update Prefs User",
      });

      const updated = await updateUserPreferences(signedUpUser.id, {
        unit: "lbs",
      });
      expect(updated.unit).toBe("lbs");

      // Verify persistence
      const prefs = await getUserPreferences(signedUpUser.id);
      expect(prefs.unit).toBe("lbs");
    });

    it("should update onboarding status", async () => {
      const { user: signedUpUser } = await signUp({
        email: "onboarding@example.com",
        password: "password123",
        name: "Onboarding User",
      });

      const updated = await updateUserPreferences(signedUpUser.id, {
        onboardingCompleted: true,
      });
      expect(updated.onboardingCompleted).toBe(true);
    });

    it("should return current preferences on empty update", async () => {
      const { user: signedUpUser } = await signUp({
        email: "empty-update@example.com",
        password: "password123",
        name: "Empty Update User",
      });

      const result = await updateUserPreferences(signedUpUser.id, {});
      expect(result.unit).toBe("kg");
      expect(result.onboardingCompleted).toBe(false);
    });

    it("should throw when preferences not found", async () => {
      await expect(
        updateUserPreferences("nonexistent-id", { unit: "lbs" }),
      ).rejects.toThrow("UserPreferencesNotFoundError");
    });
  });

  describe("signOut", () => {
    it("should invalidate the session", async () => {
      const { user: signedUpUser } = await signUp({
        email: "signout@example.com",
        password: "password123",
        name: "SignOut User",
      });

      mockHeaders = await testHelpers.getAuthHeaders({
        userId: signedUpUser.id,
      });

      // Verify session exists
      const sessionBefore = await getSession();
      expect(sessionBefore).not.toBeNull();

      // Sign out
      await signOut();

      // Session should be invalidated
      const sessionAfter = await getSession();
      expect(sessionAfter).toBeNull();
    });
  });

  describe("signIn", () => {
    it("should return a token and user on valid credentials", async () => {
      await signUp({
        email: "signin@example.com",
        password: "password123",
        name: "Sign In User",
      });

      const result = await signIn({
        email: "signin@example.com",
        password: "password123",
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("signin@example.com");
      expect(result.user.name).toBe("Sign In User");
    });

    it("should throw AuthError on invalid credentials", async () => {
      await signUp({
        email: "badpass@example.com",
        password: "password123",
        name: "Bad Pass User",
      });

      await expect(
        signIn({
          email: "badpass@example.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow(AuthError);
    });

    it("should throw AuthError for non-existent email", async () => {
      await expect(
        signIn({
          email: "nobody@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(AuthError);
    });
  });
});
