"use client";

import { googleLoginAction } from "@/app/(auth)/action";
import { Button } from "@/components/ui/button";
import { startTransition } from "react";

export const SocialLogin = () => {
  const handleGoogleLogin = () => {
    startTransition(() => {
      googleLoginAction();
    });
  };

  return (
    <Button className="w-full" variant="secondary" onClick={handleGoogleLogin}>
      Continue with Google
    </Button>
  );
};
