"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import styles from "./detalhe.module.css";

interface OrcamentoItem {
  id: string; sku: string; description?: string; color?: string;
  defaultPrice: number; appliedPrice: number; quantity: number; total: number;
}
interface Orcamento {
  id: string; date: string; status: string; paymentCond?: string; deliveryTime?: string; obs?: string;
  customer: { id: string; name: string; phone?: string; email?: string; address?: string };
  items: OrcamentoItem[];
  signatureName?: string;
  signatureDate?: string;
  signatureData?: string;
  total: number;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho", APPROVED: "Aprovado", SIGNED: "Validado/Pedido", CANCELLED: "Cancelado"
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

export default function OrcamentoDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const [orc, setOrc] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  useEffect(() => {
    // Pré-carrega a Logo para evitar atrasos no Android
    fetch("/logo-evo-white.png")
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      }).catch(() => {});
  }, []);

  const load = () => {
    fetch(`/api/orcamentos/${id}`).then((r) => r.json())
      .then((d) => { setOrc(d); setLoading(false); });
  };
  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    setUpdatingStatus(true);
    await fetch(`/api/orcamentos/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingStatus(false);
    load();
  };

  const [showSignature, setShowSignature] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const startDraw = (e: React.PointerEvent) => {
    isDrawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    canvas.setPointerCapture(e.pointerId);
  };
  const draw = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#111";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
  };
  const stopDraw = () => { isDrawing.current = false; };
  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!signatureName.trim()) { alert("Informe o nome completo do signatário"); return; }
    const canvas = canvasRef.current!;
    const signatureData = canvas.toDataURL("image/png");
    setSaving(true);
    
    try {
      const res = await fetch(`/api/orcamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          signatureName, 
          signatureData, 
          signatureDate: new Date().toISOString(),
          status: "SIGNED"
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao salvar validação");
      }

      setShowSignature(false);
      load();
    } catch (error: any) {
      alert("Erro ao validar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!adminPass) { alert("Digite sua senha"); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/orcamentos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });
      if (res.ok) {
        router.push("/orcamentos");
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao excluir");
      }
    } catch (e) {
      alert("Erro ao conectar com servidor");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem", color: "var(--muted)" }}>Carregando...</div>;
  if (!orc) return <div style={{ padding: "2rem", color: "var(--muted)" }}>Orçamento não encontrado.</div>;

  const total = orc.items.reduce((s, it) => s + it.total, 0);
  const totalDesconto = orc.items.reduce((s, it) => s + (it.defaultPrice - it.appliedPrice) * it.quantity, 0);

  const gerarPDF = async () => {
    if (!orc) return;
    setConverting(true);
    
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210; const margin = 20;

      // Header
      doc.setFillColor(17, 17, 17);
      doc.rect(0, 0, W, 35, "F");
      
      // Logo
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, 5, 25, 25);
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("EVO", margin, 20);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`ORÇAMENTO #${orc.id.slice(-6).toUpperCase()}`, W - margin, 15, { align: "right" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(orc.date).toLocaleDateString("pt-BR"), W - margin, 22, { align: "right" });

      let y = 50;

      // Cliente
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("CLIENTE", margin, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 17, 17);
      doc.setFontSize(12);
      doc.text(orc.customer.name, margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      if (orc.customer.phone) { doc.text(`Tel: ${orc.customer.phone}`, margin, y); y += 5; }
      if (orc.customer.email) { doc.text(`E-mail: ${orc.customer.email}`, margin, y); y += 5; }
      if (orc.customer.address) { doc.text(`End: ${orc.customer.address}`, margin, y); y += 5; }

      y += 12;

      // Tabela de Itens
      const colSKU = 15;
      const colDesc = 40;
      const colCor = 100;
      const colQtd = 125;
      const colUnit = 145;
      const colTotal = 195;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("SKU", colSKU, y);
      doc.text("Descrição", colDesc, y);
      doc.text("Cor", colCor, y);
      doc.text("Qtd", colQtd, y);
      doc.text("V. Unit", colUnit, y);
      doc.text("Total", colTotal, y, { align: "right" });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, y+2, 190, y+2);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      orc.items.forEach((it: any) => {
        const desc = it.description || it.sku;
        const descLines = doc.splitTextToSize(desc, 55);
        
        doc.text(it.sku, colSKU, y);
        doc.text(descLines, colDesc, y);
        doc.text(it.color || "—", colCor, y);
        doc.text(it.quantity.toString(), colQtd, y);
        doc.text(formatCurrency(it.appliedPrice), colUnit, y);
        doc.text(formatCurrency(it.total), colTotal, y, { align: "right" });
        
        const lineOffset = Math.max(descLines.length * 5, 8);
        y += lineOffset;
        if (y > 270) { doc.addPage(); y = 20; }
      });

      doc.line(20, y, 190, y);
      y += 10;

      // Resumo Final
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("TOTAL DO ORÇAMENTO:", colUnit - 15, y, { align: "right" });
      doc.text(formatCurrency(total), colTotal, y, { align: "right" });
      
      y += 15;
      if (orc.paymentCond) {
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Condições de Pagamento:", margin, y); y += 6;
        doc.setTextColor(17, 17, 17); doc.setFont("helvetica", "bold");
        doc.text(orc.paymentCond, margin, y); y += 12;
      }

      if (orc.deliveryTime) {
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Prazo de Entrega:", W - margin - 40, y - 18, { align: "right" });
        doc.setTextColor(17, 17, 17); doc.setFont("helvetica", "bold");
        doc.text(orc.deliveryTime, W - margin, y - 18, { align: "right" });
      }

      if (orc.obs) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
        const lines = doc.splitTextToSize("Observações: " + orc.obs, W - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 5;
      }

      // Assinatura
      if (orc.signatureData && orc.signatureData.startsWith("data:image")) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
        doc.text("ASSINATURA DO CLIENTE", margin, y); y += 6;
        try {
          doc.addImage(orc.signatureData, "PNG", margin, y, 60, 20);
        } catch (e) { console.error("Erro ao inserir assinatura", e); }
        y += 22;
        doc.setTextColor(17, 17, 17); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(orc.signatureName ?? "", margin, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
        const sigDate = orc.signatureDate ? new Date(orc.signatureDate).toLocaleString("pt-BR") : "—";
        doc.text(`Assinado eletronicamente em: ${sigDate}`, margin, y);
      } else if (orc.signatureName) {
        // Se tiver nome mas não tiver imagem (validação externa)
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
        doc.text("VALIDAÇÃO DO CLIENTE", margin, y); y += 6;
        doc.setTextColor(17, 17, 17); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(orc.signatureName, margin, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
        const sigDate = orc.signatureDate ? new Date(orc.signatureDate).toLocaleString("pt-BR") : "—";
        doc.text(`Validado digitalmente em: ${sigDate}`, margin, y);
      }

      // Footer
      const footY = 273;
      doc.setFillColor(245, 245, 245);
      doc.rect(0, footY, W, 24, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
      doc.text("EVO ELEGANCIA EM MOVIMENTO LTDA - 62.057.464/0001-91", W / 2, footY + 6, { align: "center" });
      doc.text("19 98122 6232  |  contato@useevo.store", W / 2, footY + 10, { align: "center" });
      doc.text("Rua Helena Argentin Canova, 61 - João Aranha | Paulínia-SP", W / 2, footY + 14, { align: "center" });
      doc.text(`Orçamento válido por 7 dias | Gerado em ${new Date().toLocaleDateString("pt-BR")}`, W / 2, footY + 19, { align: "center" });

      const pdfBlob = doc.output('blob');
      const filename = `EVO_Orcamento_${orc.id.slice(-6).toUpperCase()}.pdf`;
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      setConverting(false);

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Orçamento EVO - ${orc.customer.name}`,
            text: `Olá, segue o orçamento da EVO.`
          });
        } catch (err: any) {
          if (err.name !== 'AbortError') doc.save(filename);
        }
      } else {
        doc.save(filename);
      }
    } catch (error: any) {
      console.error("Erro PDF:", error);
      alert("Erro ao gerar PDF: " + (error.message || "Erro desconhecido"));
      setConverting(false);
    }
  };
    



  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/orcamentos" className={styles.back}>← Orçamentos</Link>
        <div className={styles.topActions}>
          <button className={styles.btnPDF} onClick={gerarPDF} disabled={converting}>
            {converting ? "⏳ Gerando..." : "⬇ Baixar PDF"}
          </button>
          {orc.status === "DRAFT" && (
            <button className={styles.btnApprove} onClick={() => updateStatus("APPROVED")} disabled={updatingStatus}>
              {updatingStatus ? "..." : "✓ Aprovar"}
            </button>
          )}
          {orc.status === "APPROVED" && !orc.signatureName && (
            <>
              <button className={styles.btnValidateExternal} onClick={() => {
                const link = `${window.location.origin}/validar/${id}`;
                const text = `Olá ${orc.customer.name}, segue o orçamento da EVO para sua validação: ${link}`;
                if (orc.customer.phone) {
                  window.open(`https://wa.me/55${orc.customer.phone.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`);
                } else {
                  window.location.href = `mailto:${orc.customer.email || ""}?subject=Validação de Orçamento EVO&body=${encodeURIComponent(text)}`;
                }
              }}>
                📧 Enviar p/ Validação
              </button>
              <button className={styles.btnApprove} onClick={() => setShowSignature(!showSignature)}>
                ✍ Validar agora
              </button>
            </>
          )}
          <button className={styles.btnDanger} onClick={() => setShowDelete(true)}>
            🗑 Excluir Orçamento
          </button>
        </div>
      </div>

      {showDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <h3>⚠️ Excluir Orçamento?</h3>
            <p>Esta ação é irreversível. Para confirmar, digite sua senha de administrador:</p>
            <input 
              type="password" 
              className="input-field" 
              value={adminPass} 
              onChange={e => setAdminPass(e.target.value)}
              placeholder="Sua senha"
              style={{ marginTop: "1rem" }}
            />
            <div className={styles.deleteActions}>
              <button className="btn-secondary" onClick={() => setShowDelete(false)}>Cancelar</button>
              <button className={styles.btnConfirmDelete} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignature && (
        <div className={styles.signaturePanel}>
          <h2 className={styles.signatureTitle}>Validação do Cliente</h2>
          <p className={styles.signatureDesc}>O orçamento será confirmado após a validação.</p>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Nome Completo</label>
            <input className="input-field" value={signatureName} onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Nome do responsável" style={{ maxWidth: 400 }} />
          </div>
          <div>
            <div className={styles.canvasLabel}>Assine abaixo</div>
            <canvas ref={canvasRef} width={500} height={150} className={styles.canvas}
              onPointerDown={startDraw} onPointerMove={draw} onPointerUp={stopDraw} />
          </div>
          <div className={styles.signatureActions}>
            <button className={styles.btnClear} onClick={clearCanvas}>Limpar</button>
            <button className={styles.btnCancel} onClick={() => setShowSignature(false)}>Cancelar</button>
            <button className={styles.btnConfirmSign} onClick={saveSignature} disabled={saving}>
              {saving ? "Salvando..." : "✓ Confirmar e Finalizar Pedido"}
            </button>
          </div>
        </div>
      )}

      {orc.signatureName && (
        <div className={styles.signedCard}>
          <div className={styles.signedIcon}>✓</div>
          <div>
            <div className={styles.signedName}>{orc.signatureName === "EXTERNAL_VALIDATION" ? "Validado via Link Externo" : orc.signatureName}</div>
            <div className={styles.signedDate}>Validado em {new Date(orc.signatureDate!).toLocaleString("pt-BR")}</div>
          </div>
          {orc.signatureData && orc.signatureData !== "EXTERNAL_VALIDATION" && <img src={orc.signatureData} alt="Assinatura" className={styles.signatureImg} />}
        </div>
      )}

      <div className={styles.headerInfo}>
        <div>
          <h1 className={styles.title}>Orçamento #{orc.id.slice(-6).toUpperCase()}</h1>
          <p className={styles.date}>{new Date(orc.date).toLocaleDateString("pt-BR", { dateStyle: "full" })}</p>
        </div>
        <span className={`${styles.status} ${styles["status" + orc.status]}`}>{STATUS_LABELS[orc.status]}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Cliente</div>
          <div className={styles.clienteName}>{orc.customer.name}</div>
          {orc.customer.phone && <div className={styles.clienteInfo}>📞 {orc.customer.phone}</div>}
          {orc.customer.email && <div className={styles.clienteInfo}>✉ {orc.customer.email}</div>}
          {orc.customer.address && <div className={styles.clienteInfo}>📍 {orc.customer.address}</div>}
          <Link href={`/clientes/${orc.customer.id}`} className={styles.clienteLink}>Ver cadastro →</Link>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Condições de Pagamento</div>
          <div className={styles.paymentText}>{orc.paymentCond || "Não informado"}</div>
          {orc.deliveryTime && (
            <>
              <div className={styles.cardLabel} style={{ marginTop: "1rem" }}>Prazo de Entrega</div>
              <div className={styles.paymentText}>{orc.deliveryTime}</div>
            </>
          )}
          {orc.obs && <><div className={styles.cardLabel} style={{ marginTop: "1rem" }}>Observações</div>
            <div className={styles.obsText}>{orc.obs}</div></>}
        </div>
      </div>

      <div className={styles.itemsCard}>
        <div className={styles.cardLabel}>Itens do Orçamento</div>
        <div className={styles.itemsTable}>
          <div className={styles.tableHead}>
            <span>Produto</span>
            <span>Cor</span>
            <span className={styles.right}>Preço</span>
            <span className={styles.right}>Qtd</span>
            <span className={styles.right}>Total</span>
          </div>
          {orc.items.map((it) => (
            <div key={it.id} className={styles.tableRow}>
              <div className={styles.prodInfo}>
                <span className={styles.sku}>{it.sku}</span>
                <span className={styles.name}>{it.description}</span>
              </div>
              <div className={styles.colorVal} data-label="Cor">{it.color || "—"}</div>
              <div className={styles.right} data-label="Preço">{formatCurrency(it.appliedPrice)}</div>
              <div className={styles.right} data-label="Qtd">{it.quantity}</div>
              <div className={styles.right} style={{ fontWeight: 600 }} data-label="Total">{formatCurrency(it.total)}</div>
            </div>
          ))}
        </div>

        {totalDesconto > 0 && (
          <div className={styles.discountRow}>
            <span>Desconto total concedido</span>
            <span>- {formatCurrency(totalDesconto)}</span>
          </div>
        )}

        <div className={styles.totalBanner}>
          <span>Total do Orçamento</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
