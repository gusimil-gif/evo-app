import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orc = await db.budget.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      items: { include: { product: { select: { sku: true, name: true } } } },
    },
  });
  if (!orc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(orc);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const agent = req.headers.get("user-agent") || "unknown";
  
  const orc = await db.budget.update({ 
    where: { id }, 
    data: { 
      status: "SIGNED", 
      signatureName: data.name || "Validado via Link Externo",
      signatureDate: new Date().toISOString(),
      signatureData: "EXTERNAL_VALIDATION",
      validationIp: ip,
      validationAgent: agent
    } 
  });
  return NextResponse.json(orc);
}
