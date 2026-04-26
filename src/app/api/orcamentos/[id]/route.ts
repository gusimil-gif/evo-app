import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const orc = await db.budget.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: { select: { sku: true, name: true } } } },
    },
  });
  if (!orc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(orc);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Capturar metadados para auditoria LGPD no ambiente logado também
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const agent = req.headers.get("user-agent") || "unknown";

    const orc = await db.budget.update({ 
      where: { id }, 
      data: { 
        status: data.status || undefined, 
        paymentCond: data.paymentCond || undefined, 
        obs: data.obs || undefined,
        signatureName: data.signatureName || undefined,
        signatureDate: data.signatureDate || undefined,
        signatureData: data.signatureData || undefined,
        validationIp: ip,
        validationAgent: agent
      } 
    });
    return NextResponse.json(orc);
  } catch (error: any) {
    console.error("ERRO UPDATE ORÇAMENTO:", error);
    return NextResponse.json({ error: error.message || "Erro interno na atualização" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const { id } = await params;
    const { password } = await req.json();

    // Buscar o usuário atual para validar a senha
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return NextResponse.json({ error: "Senha incorreta" }, { status: 403 });

    await db.budget.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO DELETE ORÇAMENTO:", error);
    return NextResponse.json({ error: "Erro ao excluir orçamento" }, { status: 500 });
  }
}
