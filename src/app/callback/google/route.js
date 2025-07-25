import { cookies } from "next/headers";
import { google } from "@/utils/arctic";
import prisma from "@/utils/prisma";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { serialize } from "cookie";

export async function GET(request) {
  const cookieStore = await cookies();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const codeVerifier = cookieStore.get("codeVerifier")?.value;

  if (!code || !codeVerifier) {
    return new Response("Missing code or verifier", { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const res = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(`Google userinfo error: ${errorText}`, {
        status: res.status,
      });
    }

    const userData = await res.json();

    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          avatarUrl: userData.picture,
        },
      });
    }

    const session = await prisma.session.create({
      data: {
        id: randomUUID(),
        userId: user.id,
      },
    });

    const cookie = serialize("sessionId", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response("OAuth callback error", { status: 500 });
  }
}
