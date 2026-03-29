import { APP_NAME } from "@/shared/constants";
import { signUpAction } from "./actions";
import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold">{APP_NAME}</h1>
        <p className="text-xs text-muted-foreground">Create your account</p>
      </div>
      <SignUpForm action={signUpAction} />
    </div>
  );
}
