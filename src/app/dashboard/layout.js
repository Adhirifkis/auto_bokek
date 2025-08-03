import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth/getAuthSession";
import { redirect } from "next/navigation";
import React from "react";
import { logoutAction } from "../(auth)/action";

export default async function DashboardLayout({ children }) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-600">Auto_Bokek</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-700">Hai, {session.user.name}</p>
            <form action={logoutAction}>
              <Button
                type="submit"
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-transform cursor-pointer hover:scale-105"
              >
                Logout
              </Button>
            </form>
          </div>
        </header>
      </div>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
