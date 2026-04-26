
import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const localPrisma = new PrismaClient();
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log("🚀 Iniciando migração para a nuvem...");

  try {
    // 1. Clientes
    const clientes = await localPrisma.customer.findMany();
    console.log(`📦 Migrando ${clientes.length} clientes...`);
    for (const c of clientes) {
      await turso.execute({
        sql: "INSERT OR REPLACE INTO Customer (id, name, email, phone, document, address, obs, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [c.id, c.name, c.email || null, c.phone || null, c.document || null, c.address || null, c.obs || null, c.createdAt.toISOString(), c.updatedAt.toISOString()]
      });
    }

    // 2. Produtos
    const produtos = await localPrisma.product.findMany();
    console.log(`📦 Migrando ${produtos.length} produtos...`);
    for (const p of produtos) {
      await turso.execute({
        sql: "INSERT OR REPLACE INTO Product (id, sku, name, description, price, purchaseCost, stock, type, color, leather, brand, category, obs, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [p.id, p.sku, p.name || null, p.description || null, p.price, p.purchaseCost || 0, p.stock, p.type || null, p.color || null, p.leather || null, p.brand || null, p.category || null, p.obs || null, p.active ? 1 : 0, p.createdAt.toISOString(), p.updatedAt.toISOString()]
      });
    }

    // 3. Parceiros
    const parceiros = await localPrisma.partner.findMany();
    console.log(`📦 Migrando ${parceiros.length} parceiros...`);
    for (const p of parceiros) {
      await turso.execute({
        sql: "INSERT OR REPLACE INTO Partner (id, name, type, phone, email, document, address, obs, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [p.id, p.name, p.type, p.phone || null, p.email || null, p.document || null, p.address || null, p.obs || null, p.createdAt.toISOString(), p.updatedAt.toISOString()]
      });
    }

    console.log("✅ Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro na migração:", error);
  } finally {
    await localPrisma.$disconnect();
  }
}

migrate();
