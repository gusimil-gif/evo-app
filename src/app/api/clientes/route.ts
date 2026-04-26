import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const clientes = await db.customer.findMany({
    where: q ? {
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { document: { contains: q } },
      ],
    } : {},
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      document: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clientes);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const cliente = await db.customer.create({ data });
  return NextResponse.json(cliente, { status: 201 });
}
