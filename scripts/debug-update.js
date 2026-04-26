const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const id = 'cmoedksv80001gp21qlacuo7o';
  try {
    const orc = await prisma.budget.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signatureName: 'Teste Depuração',
        signatureDate: new Date(),
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        validationIp: '127.0.0.1',
        validationAgent: 'Mozilla/5.0'
      }
    });
    console.log("Sucesso:", orc.id);
  } catch (error) {
    console.error("ERRO NO PRISMA:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
