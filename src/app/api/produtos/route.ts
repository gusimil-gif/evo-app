import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const active = searchParams.get("active");

  const products = await db.product.findMany({
    where: {
      AND: [
        active !== null ? { active: active === "true" } : {},
        q ? {
          OR: [
            { sku: { contains: q } },
            { name: { contains: q } },
            { description: { contains: q } },
            { type: { contains: q } },
            { color: { contains: q } },
            { brand: { contains: q } },
          ],
        } : {},
      ],
    },
    orderBy: { sku: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  // Verificar SKU duplicado
  const existing = await db.product.findUnique({ where: { sku: data.sku } });
  if (existing) {
    return NextResponse.json({ error: "SKU já cadastrado" }, { status: 400 });
  }

  const product = await db.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}
