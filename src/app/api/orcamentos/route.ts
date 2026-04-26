import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import fs from "fs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orcamentos = await db.budget.findMany({
    include: { customer: { select: { id: true, name: true, phone: true } }, items: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(orcamentos);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { customerId, paymentCond, deliveryTime, obs, items } = body;

  if (!customerId || !items || items.length === 0) {
    return NextResponse.json({ error: "Cliente e itens são obrigatórios" }, { status: 400 });
  }

  try {
    const orcamento = await db.budget.create({
      data: {
        customerId,
        paymentCond,
        deliveryTime,
        obs,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            sku: item.sku,
            description: item.description,
            color: item.color,
            defaultPrice: Number(item.defaultPrice),
            appliedPrice: Number(item.appliedPrice),
            quantity: Math.round(Number(item.quantity)),
            total: Number(item.appliedPrice) * Number(item.quantity),
          })),
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    return NextResponse.json(orcamento, { status: 201 });
  } catch (error: any) {
    const logMsg = `[${new Date().toISOString()}] ERRO AO CRIAR ORÇAMENTO: ${error.stack || error.message}\n`;
    try { fs.appendFileSync('prisma_error.log', logMsg); } catch(e) {}
    console.error(logMsg);
    return NextResponse.json({ error: "Erro ao salvar no banco de dados: " + (error.message || "Erro desconhecido") }, { status: 500 });
  }
}
