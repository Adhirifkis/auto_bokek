"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { loginAction } from "../action";
import { AlertState } from "@/components/shared/alert-state";
import { useActionState } from "react";
import { SocialLogin } from "../_components/social-login";

export default function Page() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h1>Login</h1>
        <p>Login to your account</p>
      </section>
      <form className="flex flex-col gap-2" action={action}>
        <Input
          className="shadow-2xl bg-amber-100"
          name="email"
          type="email"
          placeholder="Email"
        />
        <Input
          className="shadow-2xl bg-amber-100"
          name="password"
          type="password"
          placeholder="Password"
        />
        <Button
          className="cursor-pointer transition-transform hover:scale-103"
          type="submit"
          disabled={pending}
        >
          {pending ? "Logging in..." : "Login"}
        </Button>
        <AlertState success={state?.success} error={state?.error} />
      </form>
      <section>
        <p className="gap-5">
          Dont have an account?{" "}
          <Link
            className="text-blue-800 cursor-pointer transition-transform hover:scale-103"
            href="/register"
          >
            Register
          </Link>
        </p>
        <SocialLogin />
      </section>
    </div>
  );
}
