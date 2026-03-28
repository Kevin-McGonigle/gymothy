"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { type GetCustomExercisesParams, getCustomExercises } from "./db";

const customExercisesParamsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  search: z.string().max(100).optional(),
  bodyParts: z.array(z.string()).optional(),
  equipments: z.array(z.string()).optional(),
  targetMuscles: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export async function getCustomExercisesServer(
  params: GetCustomExercisesParams,
) {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  const session = await auth.api.getSession({
    headers: { cookie },
  });

  if (!session) {
    redirect("/sign-in");
  }

  const validatedParams = customExercisesParamsSchema.safeParse(params);

  if (!validatedParams.success) {
    const errorMessages = validatedParams.error.issues.map((e) => e.message);
    throw new Error(`Invalid params: ${errorMessages.join(", ")}`);
  }

  if (validatedParams.data.userId !== session.user.id) {
    redirect("/");
  }

  try {
    return await getCustomExercises(validatedParams.data);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch custom exercises",
    );
  }
}
