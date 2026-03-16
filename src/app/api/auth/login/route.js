import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, getCookieName } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });

    response.cookies.set({
      name: getCookieName(),
      value: token,
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}