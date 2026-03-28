export const APP_NAME = "Gymothy";
export const APP_DESCRIPTION = "The last workout app you'll ever need.";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ROUTINES: "/routines",
  ROUTINE_NEW: "/routines/new",
  ROUTINE_DETAIL: (id: string) => `/routines/${id}`,
  WORKOUT_NEW: "/workout/new",
  WORKOUT_DETAIL: (id: string) => `/workout/${id}`,
  SETTINGS: "/settings",
} as const;
