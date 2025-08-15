"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-y-6 py-8 w-full px-0.5">
      <h2 className="text-2xl font-semibold">Sign up to Musngr</h2>

      <div className="w-full">
        <div className="mt-4 w-full">
          <Button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full"
          >
            <FcGoogle className="mr-2 size-5" />
            {isLoading ? "Signing up..." : "Sign Up with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}
