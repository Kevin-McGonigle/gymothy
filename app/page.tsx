import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_NAME, AUTH_ROUTES } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          {APP_NAME}
        </h1>
        <p className="text-xl text-muted-foreground">{APP_DESCRIPTION}</p>
        <div className="flex justify-center pt-4">
          <Button
            size="xl"
            render={<Link href={AUTH_ROUTES.SIGN_IN} />}
            nativeButton={false}
          >
            Get Started
          </Button>
        </div>
      </div>
    </main>
  );
}
