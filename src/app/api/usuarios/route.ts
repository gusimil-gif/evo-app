import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await db.user.findMany({ select: { id: true, name: true, email: true, role: true }, orderBy: { name: "asc" } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, email, password, role } = await req.json();
  const hashed = await bcrypt.hash(password, 10);
  const user = await db.user.create({ data: { name, email, password: hashed, role } });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}
