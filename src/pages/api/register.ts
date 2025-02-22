import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const saltRounds = 10;

const prisma = new PrismaClient();

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  if (
    request.headers.get("Content-Type") !== "application/x-www-form-urlencoded"
  )
    return new Response("Invalid content type", { status: 400 });

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password2 = formData.get("password2") as string;

  if (!name) return new Response("No name provided.", { status: 400 });

  if (!email || !password || !password2)
    return new Response("No email or password provided.", { status: 400 });

  if (password !== password2)
    return new Response("Passwords do not match", { status: 400 });

  // validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return new Response("Invalid email", { status: 400 });

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return new Response(JSON.stringify(userWithoutPassword), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error while registering a user.", error);
    return new Response("Error while registering a user.", { status: 500 });
  }
};
