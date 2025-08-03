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
    <Button
      className="w-full cursor-pointer transition-transform hover:scale-105 gap-2.5"
      variant="outline"
      onClick={handleGoogleLogin}
    >
      Continue with Google 🅖
    </Button>
  );
};
