import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId) {
  console.log("Create session for userId:", userId);

  try {
    // Validasi userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    const session = await prisma.session.create({
      data: {
        userId,
        tokenSession: randomUUID(),
      },
    });

    return session;
  } catch (error) {
    console.error("Gagal membuat session:", error.message, error);
    throw new Error("Gagal membuat session.");
  }
}

export async function getSession(sessionId) {
  return await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function deleteSession(sessionId) {
  return await prisma.session.delete({
    where: { id: sessionId },
  });
}

export async function getAllSessions(userId) {
  return await prisma.session.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
