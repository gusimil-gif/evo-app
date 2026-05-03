import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const p = await prisma.product.findUnique({
    where: { sku: 'B.AE.FL.EL' },
    include: { movements: true }
  });
  console.log(JSON.stringify(p, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
