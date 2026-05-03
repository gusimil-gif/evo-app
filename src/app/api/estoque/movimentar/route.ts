import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, type, quantity, reason, obs } = await req.json();

  if (!productId || !type || quantity === undefined || quantity === null) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  if (quantity <= 0 && type !== "ADJUSTMENT") {
    return NextResponse.json({ error: "Quantidade deve ser maior que zero" }, { status: 400 });
  }

  if (quantity < 0 && type === "ADJUSTMENT") {
    return NextResponse.json({ error: "Quantidade não pode ser negativa" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  // Calcular novo estoque
  let newStock = product.stock;
  if (type === "ENTRY") newStock += quantity;
  else if (type === "EXIT" || type === "LOSS") newStock -= quantity;
  else if (type === "ADJUSTMENT") newStock = quantity; // Ajuste define valor absoluto

  if (newStock < 0) {
    return NextResponse.json({ error: "Estoque não pode ficar negativo" }, { status: 400 });
  }

  // Criar movimentação e atualizar estoque em transação
  const [movement] = await db.$transaction([
    db.inventoryMovement.create({
      data: {
        productId,
        type,
        quantity,
        userId: session.userId as string,
        reason,
        obs,
      },
    }),
    db.product.update({
      where: { id: productId },
      data: { stock: newStock },
    }),
  ]);

  return NextResponse.json(movement, { status: 201 });
}
