"use client";

import { authClient } from "@/lib/auth-client";

export const useSession = authClient.useSession;

export const signOut = authClient.signOut;
