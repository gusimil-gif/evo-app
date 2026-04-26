
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const turso = createClient({
  url: "libsql://evo-db-gusimil-gif.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcyMDM0NDQsImlkIjoiMDE5ZGM5OTMtYTQwMS03NWZlLWE2NDktMDdmNDhiN2EzZjYwIiwicmlkIjoiNzMxM2QzZWYtZjg5OC00MmRjLTlhODgtNmFkOGE2MWIzYmIwIn0.G8nUW1YsQCclTOZVwMmAuCjfbJc5Y8zCNFa9H4Qd2Kuoz7QGqGp_4UJ3_q2OLrTV5kq7isOhuWPZWhjZ5X4JDw",
});

async function updateCloudDb() {
  console.log("🛠️ Tentando adicionar coluna 'deliveryTime' na nuvem...");
  try {
    await turso.execute("ALTER TABLE Budget ADD COLUMN deliveryTime TEXT;");
    console.log("✅ Coluna adicionada com sucesso!");
  } catch (error: any) {
    if (error.message.includes("duplicate column name")) {
      console.log("ℹ️ A coluna já existe.");
    } else {
      console.error("❌ Erro:", error.message);
    }
  }
}

updateCloudDb();
