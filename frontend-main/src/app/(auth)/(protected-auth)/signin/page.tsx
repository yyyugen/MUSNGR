import Link from "next/link";

import { siteConfig } from "@/config/site";
import SignInForm from "@/components/auth/signin-form";

export default function SignIn() {
  return (
    <div className="flex flex-col items-start max-w-sm mx-auto h-dvh overflow-hidden pt-4 md:pt-20">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[radial-gradient(hsl(var(--accent-foreground)/0.1)_1px,transparent_1px)] [background-size:8px_8px] [mask-image:radial-gradient(ellipse_60%_60%_at_center,#000_0%,transparent_80%)]"></div>

      <div className="flex items-center w-full py-8 border-b border-border/80">
        <Link href="/" className="flex items-center gap-x-2">
          <h1 className="text-lg font-medium">{siteConfig.name}</h1>
        </Link>
      </div>

      <SignInForm />

      <div className="flex flex-col items-start w-full">
        <p className="text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary">
            Terms of Service{" "}
          </Link>
          and{" "}
          <Link href="/privacy" className="text-primary">
            Privacy Policy
          </Link>
        </p>
      </div>
      <div className="flex items-start mt-auto border-t border-border/80 py-6 w-full">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
