import { APP_NAME } from "@/shared/constants";
import { signInAction } from "./actions";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold">{APP_NAME}</h1>
        <p className="text-xs text-muted-foreground">Sign in to your account</p>
      </div>
      <LoginForm action={signInAction} />
    </div>
  );
}
