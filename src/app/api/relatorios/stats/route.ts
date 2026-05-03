import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Valor em Estoque
    const products = await db.product.findMany({ where: { active: true } });
    const stockTotalCost = products.reduce((acc, p) => acc + (p.stock * (p.totalCost || p.purchaseCost || 0)), 0);
    const stockSaleValue = products.reduce((acc, p) => acc + (p.stock * (p.price || 0)), 0);

    // 2. Faturamento (Orçamentos SIGNED)
    const budgets = await db.budget.findMany({ 
      where: { status: "SIGNED" },
      include: { items: true }
    });
    
    const revenue = budgets.reduce((acc, b) => {
      const bTotal = b.items.reduce((sum, it) => sum + it.total, 0);
      return acc + bTotal;
    }, 0);

    const totalOrders = budgets.length;
    const customersCount = await db.customer.count();

    return new NextResponse(JSON.stringify({
      stockTotalCost: stockTotalCost || 0,
      stockSaleValue: stockSaleValue || 0,
      revenue: revenue || 0,
      totalOrders: totalOrders || 0,
      customersCount: customersCount || 0,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("ERRO STATS:", error);
    return NextResponse.json({ stockTotalCost: 0, stockSaleValue: 0, revenue: 0, totalOrders: 0, customersCount: 0 });
  }
}
