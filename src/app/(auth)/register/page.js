"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "../action";
import { AlertState } from "@/components/shared/alert-state";

export default function Page() {
  const [state, action, pending] = useActionState(registerAction, null);

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h1>Register</h1>
        <p>Create an account</p>
      </section>
      <form className="flex flex-col gap-2" action={action}>
        <Input name="name" type="text" placeholder="Name" />
        <Input name="email" type="email" placeholder="Email" />
        <Input name="password" type="password" placeholder="Password" />
        <Button
          className="cursor-pointer transition-transform hover:scale-103"
          type="submit"
          disabled={pending}
        >
          {pending ? "Registering..." : "Register"}
        </Button>
        <AlertState success={state?.success} error={state?.error} />
      </form>
      <section>
        <p>
          Already have an account?{" "}
          <Link
            className="text-blue-800 cursor-pointer transition-transform hover:scale-103"
            href="/login"
          >
            Login
          </Link>
        </p>
      </section>
    </div>
  );
}
