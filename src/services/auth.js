import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId) {
  return await prisma.session.create({
    data: { userId },
  });
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
