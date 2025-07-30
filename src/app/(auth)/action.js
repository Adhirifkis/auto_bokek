"use server";

import { getUserByEmail, createUser } from "@/services/user";
import { createSession, verifyPassword } from "@/services/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as arctic from "arctic";
import { google } from "@/utils/arctic";

export async function loginAction(_, formData) {
  const cookieStore = await cookies();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "All fields are required" };
  }

  const getWithPassword = true;
  const user = await getUserByEmail(email, getWithPassword);
  if (!user) {
    return { error: "User not found" };
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return { error: "Invalid password" };
  }

  const session = await createSession(user.id);
  cookieStore.set("session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect("/dashboard");
}

export async function registerAction(_, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!name || !email || !password) {
    console.log("All fields are required");
    return { error: "All fields are required" };
  }

  const user = await getUserByEmail(email);
  if (user) {
    return { error: "User already exists" };
  }

  const newUser = await createUser(name, email, password);
  return { success: "User created successfully", user: newUser };
}

export async function googleLoginAction() {
  const cookieStore = await cookies();

  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const scopes = ["openid", "profile", "email"];

  const url = google.createAuthorizationURL(state, codeVerifier, scopes);

  cookieStore.set("codeVerifier", codeVerifier);

  redirect(url);
}
