import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    include: {
      movements: true
    }
  });
  
  for (const p of products) {
    if (p.movements.length > 0) {
      console.log(`Product: ${p.sku} | Stock: ${p.stock}`);
      for (const m of p.movements) {
        console.log(`  Mov: ${m.type} | Qty: ${m.quantity}`);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
