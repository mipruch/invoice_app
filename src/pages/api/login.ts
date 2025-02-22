import type { APIRoute } from "astro";
import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  if (request.headers.get("Content-Type") !== "application/json")
    return new Response("Invalid content type", { status: 400 });

  const body = await request.json();
  console.log(body);
  const email = body.email as string;
  const password = body.password as string;

  if (!email || !password) {
    return new Response("No email or password provided.", { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return new Response("Password or email is wrong.", { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return new Response(JSON.stringify(userWithoutPassword), { status: 200 });
  } catch (error) {
    console.error("Error while logging in a user.", error);
    return new Response("Internal server error", { status: 500 });
  }
};
