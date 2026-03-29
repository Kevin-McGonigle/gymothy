"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/shared/constants";

import type { SignUpState } from "./actions";

export function SignUpForm({
  action,
}: {
  action: (prev: SignUpState, formData: FormData) => Promise<SignUpState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" maxLength={255} required />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          maxLength={128}
          required
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Signing up\u2026" : "Sign up"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
