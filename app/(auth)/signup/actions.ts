"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { AuthError, signUp } from "@/modules/auth";
import { ROUTES } from "@/shared/constants";

export type SignUpState = { error: string } | null;

const signUpSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(128),
});

export async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please enter a valid email address and password" };
  }

  try {
    await signUp(parsed.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "An account with this email already exists" };
    }
    return { error: "Something went wrong" };
  }
  redirect(ROUTES.HOME);
}
