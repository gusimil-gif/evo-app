import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const partners = await db.partner.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(partners || []);
  } catch (error: any) {
    console.error("ERRO CRÍTICO GET PARCEIROS:", error);
    // Se der erro de banco, retornamos vazio para não quebrar a tela, mas logamos no servidor
    return NextResponse.json([], { status: 200 }); 
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const partner = await db.partner.create({ data });
    return NextResponse.json(partner, { status: 201 });
  } catch (error: any) {
    console.error("ERRO POST PARCEIROS:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar parceiro" }, { status: 500 });
  }
}
