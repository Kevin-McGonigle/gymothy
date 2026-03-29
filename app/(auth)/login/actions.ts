"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { AuthError, signIn } from "@/modules/auth";
import { ROUTES } from "@/shared/constants";

export type SignInState = { error: string } | null;

const signInSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(128),
});

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please enter a valid email address and password" };
  }

  try {
    await signIn(parsed.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong" };
  }
  redirect(ROUTES.HOME);
}
