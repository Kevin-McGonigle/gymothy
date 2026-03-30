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
