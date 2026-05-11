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
      partner: true,
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
    
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const agent = req.headers.get("user-agent") || "unknown";

    // Buscar orçamento atual para verificar se já foi baixado
    const existing = await db.budget.findUnique({ 
      where: { id },
      include: { items: true }
    });
    if (!existing) return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });

    // Lógica de baixa de estoque: ocorre quando o status muda para SIGNED e ainda não foi baixado
    const isFinalizing = data.status === "SIGNED" && !existing.stockDeducted;

    const updated = await db.$transaction(async (tx) => {
      // 1. Atualizar o orçamento
      const orc = await tx.budget.update({ 
        where: { id }, 
        data: { 
          status: data.status || undefined, 
          paymentCond: data.paymentCond || undefined, 
          obs: data.obs || undefined,
          signatureName: data.signatureName || undefined,
          signatureDate: data.signatureDate || undefined,
          signatureData: data.signatureData || undefined,
          partnerId: data.partnerId || undefined,
          validationIp: ip,
          validationAgent: agent,
          stockDeducted: isFinalizing ? true : undefined
        } 
      });

      // 2. Se estiver finalizando, baixar estoque de cada item
      if (isFinalizing) {
        for (const item of existing.items) {
          // Registrar movimentação de saída
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: "EXIT",
              quantity: item.quantity,
              userId: session.userId as string,
              reason: `Pedido #${orc.id.slice(-6).toUpperCase()}`,
              obs: `Baixa automática via validação de pedido.`
            }
          });

          // Atualizar saldo no produto
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      return orc;
    });

    return NextResponse.json(updated);
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
    const user = await db.user.findUnique({ where: { id: session.userId as string } });
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
