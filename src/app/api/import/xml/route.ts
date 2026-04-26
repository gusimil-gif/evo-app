import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

    const xmlData = await file.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlData);

    // Estrutura básica de uma NF-e (simplificada para o exemplo)
    // nfeProc -> NFe -> infNFe -> det (lista de produtos)
    const nfe = jsonObj.nfeProc?.NFe || jsonObj.NFe;
    if (!nfe) return NextResponse.json({ error: "Formato de XML inválido ou não suportado" }, { status: 400 });

    const items = nfe.infNFe?.det;
    if (!items) return NextResponse.json({ error: "Nenhum produto encontrado no XML" }, { status: 400 });

    // Normalizar para array se for um único item
    const itemsArray = Array.isArray(items) ? items : [items];

    const processedItems = itemsArray.map((item: any) => {
      const prod = item.prod;
      return {
        sku: prod.cProd, // Código do produto no XML
        name: prod.xProd, // Nome do produto no XML
        quantity: parseFloat(prod.qCom),
        unit: prod.uCom,
        price: parseFloat(prod.vUnCom),
        total: parseFloat(prod.vProd),
      };
    });

    return NextResponse.json({ 
      nfeNumber: nfe.infNFe?.ide?.nNF,
      issuer: nfe.infNFe?.emit?.xNome,
      items: processedItems 
    });

  } catch (error) {
    console.error("Erro ao importar XML:", error);
    return NextResponse.json({ error: "Erro interno ao processar XML" }, { status: 500 });
  }
}
