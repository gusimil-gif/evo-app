import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { items, obs } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const results = await db.$transaction(async (tx) => {
      const report = { created: 0, updated: 0, errors: [] as string[] };

      for (const item of items) {
        // Buscar produto pelo SKU (cProd do XML)
        let product = await tx.product.findUnique({ where: { sku: item.sku } });

        if (!product) {
           // Se não existe, podemos criar ou apenas pular/reportar erro.
           // Para este MVP, vamos apenas reportar erro para evitar cadastros incompletos sem controle.
           report.errors.push(`Produto SKU ${item.sku} não encontrado no cadastro.`);
           continue;
        }

        // Registrar movimentação de entrada
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: "ENTRY",
            quantity: item.quantity,
            userId: session.userId as string,
            reason: "IMPORT_XML",
            obs: obs || "Importação via XML de NF-e",
          },
        });

        // Atualizar estoque do produto
        await tx.product.update({
          where: { id: product.id },
          data: { 
            stock: { increment: item.quantity },
            // Opcionalmente atualizar o custo de compra se for uma NF-e de entrada
            purchaseCost: item.price,
            totalCost: (item.price || 0) + (product.packagingCost || 0) + (product.shippingCost || 0) + (product.otherCosts || 0)
          },
        });

        report.updated++;
      }

      return report;
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("Erro ao confirmar importação:", error);
    return NextResponse.json({ error: "Erro ao confirmar importação" }, { status: 500 });
  }
}
