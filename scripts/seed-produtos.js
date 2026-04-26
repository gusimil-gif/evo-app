const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({});

const products = [
  // === MOCHILA SLIM VICENZA ===
  { sku: "M.PR.FL.VI", type: "Mochila", color: "Preto",        leather: "Floater",  brand: "Black Stone",   description: "Mochila Slim modelo Vicenza",                  category: "Mochilas" },
  { sku: "M.MP.FL.VI", type: "Mochila", color: "Marrom Pinhão",leather: "Floater",  brand: "Toffee Claro",  description: "Mochila Slim modelo Vicenza",                  category: "Mochilas" },
  { sku: "M.ME.FL.VI", type: "Mochila", color: "Marrom Escuro", leather: "Floater", brand: "Toffee",        description: "Mochila Slim modelo Vicenza",                  category: "Mochilas" },
  { sku: "M.AC.FL.VI", type: "Mochila", color: "Azul Claro",    leather: "Floater", brand: "Midnight Blue", description: "Mochila Slim modelo Vicenza",                  category: "Mochilas" },
  { sku: "M.CA.FL.VI", type: "Mochila", color: "Caramelo",      leather: "Floater", brand: "Tartufo",       description: "Mochila Slim modelo Vicenza",                  category: "Mochilas" },

  // === BOLSA FEMININA ELÓRA ===
  { sku: "B.VE.LI.EL", type: "Bolsa", color: "Vermelho Escuro", leather: "Liso",    brand: "Velvet Rouge",       description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.AE.FL.EL", type: "Bolsa", color: "Azul Escuro",     leather: "Floater", brand: "Blue Dahlia",        description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.PR.LI.EL", type: "Bolsa", color: "Preto",           leather: "Liso",    brand: null,                 description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.PR.FL.EL", type: "Bolsa", color: "Preto",           leather: "Floater", brand: null,                 description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.PR.CO.EL", type: "Bolsa", color: "Preto",           leather: "Croco",   brand: null,                 description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.PR.PI.EL", type: "Bolsa", color: "Preto",           leather: "Piton",   brand: null,                 description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.CA.LI.EL", type: "Bolsa", color: "Caramelo",        leather: "Liso",    brand: "Mocha Luxe",         description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.ME.FL.EL", type: "Bolsa", color: "Marrom Escuro",   leather: "Floater", brand: "Mocha Luxe Floater", description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.ME.CO.EL", type: "Bolsa", color: "Marrom Escuro",   leather: "Croco",   brand: "Mocha Luxe Croco",   description: "Bolsa Feminina Elóra", category: "Bolsas" },
  { sku: "B.ME.PI.EL", type: "Bolsa", color: "Marrom Escuro",   leather: "Piton",   brand: "Mocha Luxe Piton",   description: "Bolsa Feminina Elóra", category: "Bolsas" },

  // === MOCHILA COMPACTA MILAN ===
  { sku: "M.PR.FL.MI", type: "Mochila", color: "Preto",         leather: "Floater", brand: null, description: "Mochila Compacta modelo Milan", category: "Mochilas" },
  { sku: "M.MP.FL.MI", type: "Mochila", color: "Marrom Pinhão", leather: "Floater", brand: null, description: "Mochila Compacta modelo Milan", category: "Mochilas" },
  { sku: "M.ME.FL.MI", type: "Mochila", color: "Marrom Escuro", leather: "Floater", brand: null, description: "Mochila Compacta modelo Milan", category: "Mochilas" },
  { sku: "M.AC.FL.MI", type: "Mochila", color: "Azul Claro",    leather: "Floater", brand: null, description: "Mochila Compacta modelo Milan", category: "Mochilas" },

  // === MOCHILA BORDO MONARCA ===
  { sku: "M.PR.FL.MO", type: "Mochila", color: "Preto",         leather: "Floater", brand: null, description: "Mochila Bordo modelo Monarca", category: "Mochilas" },
  { sku: "M.MP.FL.MO", type: "Mochila", color: "Marrom Pinhão", leather: "Floater", brand: null, description: "Mochila Bordo modelo Monarca", category: "Mochilas" },
  { sku: "M.ME.FL.MO", type: "Mochila", color: "Marrom Escuro", leather: "Floater", brand: null, description: "Mochila Bordo modelo Monarca", category: "Mochilas" },

  // === MOCHILA LONA ESTONADA SELVAGGIO ===
  { sku: "M.PR.ES.SE", type: "Mochila", color: "Preto",       leather: "Estonado", brand: "Vulcano",     description: "Mochila Lona estonada/couro modelo Selvaggio", category: "Mochilas" },
  { sku: "M.BC.ES.SE", type: "Mochila", color: "Bege Claro",  leather: "Estonado", brand: "Duna Urbana", description: "Mochila Lona estonada/couro modelo Selvaggio", category: "Mochilas" },
  { sku: "M.VC.ES.SE", type: "Mochila", color: "Verde Claro", leather: "Estonado", brand: "Storm Verde", description: "Mochila Lona estonada/couro modelo Selvaggio", category: "Mochilas" },

  // === DUFFLE BAG ARIS ===
  { sku: "D.CA.CO.AR", type: "Duffle Bag", color: "Caramelo",      leather: "Croco",   brand: "Noce Croco",  description: "Duffle Bag Aris", category: "Duffle Bag" },
  { sku: "D.ME.PI.AR", type: "Duffle Bag", color: "Marrom Escuro", leather: "Piton",   brand: "Noce Piton",  description: "Duffle Bag Aris", category: "Duffle Bag" },
  { sku: "D.CA.LI.AR", type: "Duffle Bag", color: "Caramelo",      leather: "Liso",    brand: "Brulee",      description: "Duffle Bag Aris", category: "Duffle Bag" },
  { sku: "D.PR.LI.AR", type: "Duffle Bag", color: "Preto",         leather: "Liso",    brand: "Notte",       description: "Duffle Bag Aris", category: "Duffle Bag" },
  { sku: "D.PR.CO.AR", type: "Duffle Bag", color: "Preto",         leather: "Croco",   brand: "Notte Croco", description: "Duffle Bag Aris", category: "Duffle Bag" },
  { sku: "D.PR.PI.AR", type: "Duffle Bag", color: "Preto",         leather: "Piton",   brand: "Notte Piton", description: "Duffle Bag Aris", category: "Duffle Bag" },

  // === SHOULDER BAG TREVISO ===
  { sku: "S.PR.FL.ST", type: "Shoulder Bag", color: "Preto",         leather: "Floater",  brand: null, description: "Shoulder Bag Treviso", category: "Shoulder Bag" },
  { sku: "S.ME.FL.ST", type: "Shoulder Bag", color: "Marrom Escuro", leather: "Floater",  brand: null, description: "Shoulder Bag Treviso", category: "Shoulder Bag" },
  { sku: "S.AC.FL.ST", type: "Shoulder Bag", color: "Azul Claro",    leather: "Floater",  brand: null, description: "Shoulder Bag Treviso", category: "Shoulder Bag" },

  // === SHOULDER BAG SELVAGGIO ===
  { sku: "S.PR.ES.SS", type: "Shoulder Bag", color: "Preto",       leather: "Estonado", brand: null, description: "Shoulder Bag Selvaggio", category: "Shoulder Bag" },
  { sku: "S.BC.ES.SS", type: "Shoulder Bag", color: "Bege Claro",  leather: "Estonado", brand: null, description: "Shoulder Bag Selvaggio", category: "Shoulder Bag" },
  { sku: "S.VC.ES.SS", type: "Shoulder Bag", color: "Verde Claro", leather: "Estonado", brand: null, description: "Shoulder Bag Selvaggio", category: "Shoulder Bag" },

  // === NECESSAIRE SCRIM ===
  { sku: "N.PR.FL.NE", type: "Necessaire", color: "Preto",         leather: "Floater", brand: null, description: "Necessaire Scrim", category: "Necessaire" },
  { sku: "N.ME.FL.NE", type: "Necessaire", color: "Marrom Escuro", leather: "Floater", brand: null, description: "Necessaire Scrim", category: "Necessaire" },
  { sku: "N.MP.FL.NE", type: "Necessaire", color: "Marrom Pinhão", leather: "Floater", brand: null, description: "Necessaire Scrim", category: "Necessaire" },
  { sku: "N.CR.FL.NE", type: "Necessaire", color: "Caramelo",      leather: "Floater", brand: null, description: "Necessaire Scrim", category: "Necessaire" },

  // === ORGANIZADOR TECH DOCK ===
  { sku: "O.PR.FL.OT", type: "Organizador", color: "Preto",         leather: "Floater", brand: null, description: "Organizador Tech Dock", category: "Acessórios" },
  { sku: "O.ME.FL.OT", type: "Organizador", color: "Marrom Escuro", leather: "Floater", brand: null, description: "Organizador Tech Dock", category: "Acessórios" },
  { sku: "O.MP.FL.OT", type: "Organizador", color: "Marrom Pinhão", leather: "Floater", brand: null, description: "Organizador Tech Dock", category: "Acessórios" },
  { sku: "O.AC.FL.OT", type: "Organizador", color: "Azul Claro",    leather: "Floater", brand: null, description: "Organizador Tech Dock", category: "Acessórios" },
  { sku: "O.CR.FL.OT", type: "Organizador", color: "Caramelo",      leather: "Floater", brand: null, description: "Organizador Tech Dock", category: "Acessórios" },

  // === ORGANIZADOR DE MESA DOCK ===
  { sku: "O.PR.LA.OM", type: "Organizador", color: "Preto",         leather: "Latego", brand: null, description: "Organizador de Mesa Dock", category: "Acessórios" },
  { sku: "O.ME.LA.OM", type: "Organizador", color: "Caramelo",      leather: "Latego", brand: null, description: "Organizador de Mesa Dock", category: "Acessórios" },
  { sku: "O.LA.LA.OM", type: "Organizador", color: "Marrom Escuro", leather: "Latego", brand: null, description: "Organizador de Mesa Dock", category: "Acessórios" },

  // === DESKPAD DOCK ===
  { sku: "P.PR.TO.DK", type: "Deskpad", color: "Preto",         leather: "Toledo", brand: null, description: "Deskpad Dock", category: "Acessórios" },
  { sku: "C.CR.TO.DK", type: "Deskpad", color: "Caramelo",      leather: "Toledo", brand: null, description: "Deskpad Dock", category: "Acessórios" },
  { sku: "P.ME.TO.DK", type: "Deskpad", color: "Marrom Escuro", leather: "Toledo", brand: null, description: "Deskpad Dock", category: "Acessórios" },

  // === CARTEIRA PORTA CARTÃO ===
  { sku: "C.PR.LI.CA", type: "Carteira", color: "Preto",        leather: "Liso", brand: null, description: "Carteira porta cartão", category: "Acessórios" },
  { sku: "C.MC.LI.CA", type: "Carteira", color: "Marrom Claro", leather: "Liso", brand: null, description: "Carteira porta cartão", category: "Acessórios" },

  // === KIT TECNOLÓGICO ===
  { sku: "K.PR.VA.KI", type: "Kit", color: "Preto",        leather: "Vários", brand: null, description: "Kit Tecnológico", category: "Kits" },
  { sku: "K.MC.VA.KI", type: "Kit", color: "Marrom Claro", leather: "Vários", brand: null, description: "Kit Tecnológico", category: "Kits" },
];

async function main() {
  console.log(`\n🚀 Iniciando cadastro de ${products.length} produtos...\n`);
  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) {
      console.log(`  ⏭  Já existe: ${p.sku}`);
      skipped++;
      continue;
    }
    await prisma.product.create({ data: p });
    console.log(`  ✅ Criado: ${p.sku} — ${p.description}`);
    created++;
  }

  console.log(`\n✔ Concluído! ${created} criados, ${skipped} ignorados (já existiam).\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
