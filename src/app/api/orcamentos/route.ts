import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import fs from "fs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orcamentos = await db.budget.findMany({
    include: { 
      customer: { select: { id: true, name: true, phone: true } }, 
      partner: { select: { id: true, name: true, type: true } },
      items: true
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(orcamentos);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { customerId, partnerId, paymentCond, deliveryTime, obs, items } = body;

  if (!customerId && !partnerId) {
    return NextResponse.json({ error: "Cliente ou Parceiro é obrigatório" }, { status: 400 });
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Itens são obrigatórios" }, { status: 400 });
  }

  try {
    let finalCustomerId = customerId;

    // Se informou um parceiro, garantir que ele tenha um registro de "cliente" para manter a integridade do banco
    if (partnerId && !finalCustomerId) {
      const partner = await db.partner.findUnique({ where: { id: partnerId } });
      if (!partner) return NextResponse.json({ error: "Parceiro não encontrado" }, { status: 404 });

      // Tenta achar cliente pelo documento ou nome
      let customer = await db.customer.findFirst({
        where: { 
          OR: [
            { document: partner.document || undefined },
            { name: partner.name }
          ]
        }
      });

      if (!customer) {
        customer = await db.customer.create({
          data: {
            name: partner.name,
            document: partner.document,
            phone: partner.phone,
            email: partner.email,
            address: partner.address,
            obs: `Criado automaticamente a partir do parceiro ${partner.name}`
          }
        });
      }
      finalCustomerId = customer.id;
    }

    const orcamento = await db.budget.create({
      data: {
        customerId: finalCustomerId,
        partnerId: partnerId || undefined,
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
