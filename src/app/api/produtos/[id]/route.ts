import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { movements: { include: { user: { select: { name: true } } }, orderBy: { date: "desc" }, take: 20 } },
  });

  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rawData = await req.json();
  
  // Filtrar campos permitidos para evitar erro no Prisma
  const data = {
    sku: rawData.sku,
    name: rawData.name,
    type: rawData.type,
    color: rawData.color,
    leather: rawData.leather,
    brand: rawData.brand,
    description: rawData.description,
    category: rawData.category,
    active: rawData.active,
    price: rawData.price,
    suggestedPrice: rawData.suggestedPrice,
    purchaseCost: rawData.purchaseCost,
    packagingCost: rawData.packagingCost,
    shippingCost: rawData.shippingCost,
    otherCosts: rawData.otherCosts,
    totalCost: rawData.totalCost,
    obs: rawData.obs,
  };

  const product = await db.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
