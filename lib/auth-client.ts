"use client";

import { createAuthClient } from "better-auth/react";
import { config } from "./config";

/**
 * Better Auth client instance for client-side session management.
 */
export const authClient = createAuthClient({
  baseURL: config.auth.url,
});

export const { useSession, signIn, signUp, signOut } = authClient;
