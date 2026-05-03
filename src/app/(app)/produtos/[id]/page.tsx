"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "../novo/form.module.css";
import detailStyles from "./detail.module.css";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: string; sku: string; name?: string; type?: string; color?: string;
  leather?: string; brand?: string; price: number;
  suggestedPrice?: number; purchaseCost?: number; packagingCost?: number;
  shippingCost?: number; otherCosts?: number; totalCost?: number;
  stock: number; active: boolean; obs?: string; category?: string; description?: string;
  movements: Array<{ id: string; type: string; quantity: number; date: string; reason?: string; obs?: string; user: { name: string } }>;
}

const MOVEMENT_LABELS: Record<string, string> = {
  ENTRY: "Entrada", EXIT: "Saída", ADJUSTMENT: "Ajuste", LOSS: "Perda"
};

export default function ProdutoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showMovement, setShowMovement] = useState(false);
  const [movement, setMovement] = useState<any>({ type: "ENTRY", quantity: "", reason: "", obs: "" });
  const [movSaving, setMovSaving] = useState(false);

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [dupForm, setDupForm] = useState({ sku: "", color: "", leather: "" });
  const [dupSaving, setDupSaving] = useState(false);
  const [dupError, setDupError] = useState("");

  useEffect(() => {
    fetch(`/api/produtos/${id}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setForm(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const body = {
      ...form,
      price: parseFloat(form.price) || 0,
      suggestedPrice: form.suggestedPrice ? parseFloat(form.suggestedPrice) : null,
      purchaseCost: form.purchaseCost ? parseFloat(form.purchaseCost) : null,
      packagingCost: form.packagingCost ? parseFloat(form.packagingCost) : null,
      shippingCost: form.shippingCost ? parseFloat(form.shippingCost) : null,
      otherCosts: form.otherCosts ? parseFloat(form.otherCosts) : null,
      totalCost: (parseFloat(form.purchaseCost) || 0) + 
                 (parseFloat(form.packagingCost) || 0) + 
                 (parseFloat(form.shippingCost) || 0) + 
                 (parseFloat(form.otherCosts) || 0)
    };
    
    const res = await fetch(`/api/produtos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setProduct({ ...data, movements: product?.movements ?? [] });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleMovement = async () => {
    const parsedQty = parseInt(String(movement.quantity));
    if (isNaN(parsedQty)) {
      alert("Por favor, preencha a quantidade.");
      return;
    }

    setMovSaving(true);
    const res = await fetch(`/api/estoque/movimentar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, ...movement, quantity: parsedQty }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      alert("Erro ao registrar movimentação");
      setMovSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!dupForm.sku.trim()) { setDupError("SKU é obrigatório"); return; }
    setDupSaving(true);
    setDupError("");
    
    const payload = {
      ...product,
      id: undefined,
      movements: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      stock: 0,
      sku: dupForm.sku.toUpperCase(),
      color: dupForm.color,
      leather: dupForm.leather
    };

    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/produtos/${data.id}`);
    } else {
      const data = await res.json();
      setDupError(data.error || "Erro ao duplicar");
      setDupSaving(false);
    }
  };

  const set = (field: string, value: any) => setForm((f: any) => ({ ...f, [field]: value }));
  const setMov = (field: string, value: any) => setMovement((m) => ({ ...m, [field]: value }));

  if (loading) return <div className={detailStyles.loading}>Carregando...</div>;
  if (!product) return <div className={detailStyles.loading}>Produto não encontrado.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/produtos" className={styles.back}>← Produtos</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <h1 className={styles.title}>{product.name || product.sku}</h1>
          {isAdmin && !editing && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className={styles.btnCancel} style={{ cursor: "pointer" }} onClick={() => setShowDuplicateModal(true)}>Duplicar</button>
              <button className={styles.btnSave} onClick={() => setEditing(true)}>Editar</button>
            </div>
          )}
          {editing && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className={styles.btnCancel} style={{ cursor: "pointer" }} onClick={() => setEditing(false)}>Cancelar</button>
              <button className={styles.btnSave} onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.form}>
        {/* Dados principais */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Identificação</h2>
          <div className={styles.grid2}>
            <div><label className="label">SKU</label>
              {editing ? <input className="input-field" value={form.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} />
                : <div className={detailStyles.value}>{product.sku}</div>}</div>
            <div><label className="label">Nome Comercial</label>
              {editing ? <input className="input-field" value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
                : <div className={detailStyles.value}>{product.name || "—"}</div>}</div>
          </div>
          <div><label className="label">Descrição</label>
            {editing ? <input className="input-field" value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
              : <div className={detailStyles.value}>{product.description || "—"}</div>}</div>
          <div className={styles.grid3}>
            <div><label className="label">Tipo</label>
              {editing ? <input className="input-field" value={form.type || ""} onChange={(e) => set("type", e.target.value)} />
                : <div className={detailStyles.value}>{product.type || "—"}</div>}</div>
            <div><label className="label">Cor</label>
              {editing ? <input className="input-field" value={form.color || ""} onChange={(e) => set("color", e.target.value)} />
                : <div className={detailStyles.value}>{product.color || "—"}</div>}</div>
            <div><label className="label">Couro</label>
              {editing ? <input className="input-field" value={form.leather || ""} onChange={(e) => set("leather", e.target.value)} />
                : <div className={detailStyles.value}>{product.leather || "—"}</div>}</div>
          </div>
          <div className={styles.grid2}>
            <div><label className="label">Marca</label>
              {editing ? <input className="input-field" value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} />
                : <div className={detailStyles.value}>{product.brand || "—"}</div>}</div>
            <div><label className="label">Categoria</label>
              {editing ? <input className="input-field" value={form.category || ""} onChange={(e) => set("category", e.target.value)} />
                : <div className={detailStyles.value}>{product.category || "—"}</div>}</div>
          </div>
        </div>

        {/* Custos e Precificação */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Custos & Precificação</h2>
          <div className={styles.grid2}>
             <div>
                <label className="label">Custo de Compra (R$)</label>
                {editing ? <input className="input-field" type="number" step="0.01" value={form.purchaseCost || ""} onChange={(e) => set("purchaseCost", e.target.value)} />
                : <div className={detailStyles.value}>{product.purchaseCost ? `R$ ${product.purchaseCost.toFixed(2).replace(".", ",")}` : "—"}</div>}
             </div>
             <div>
                <label className="label">Custo Embalagem (R$)</label>
                {editing ? <input className="input-field" type="number" step="0.01" value={form.packagingCost || ""} onChange={(e) => set("packagingCost", e.target.value)} />
                : <div className={detailStyles.value}>{product.packagingCost ? `R$ ${product.packagingCost.toFixed(2).replace(".", ",")}` : "—"}</div>}
             </div>
          </div>
          <div className={styles.grid3}>
             <div>
                <label className="label">Frete Fornecedor (R$)</label>
                {editing ? <input className="input-field" type="number" step="0.01" value={form.shippingCost || ""} onChange={(e) => set("shippingCost", e.target.value)} />
                : <div className={detailStyles.value}>{product.shippingCost ? `R$ ${product.shippingCost.toFixed(2).replace(".", ",")}` : "—"}</div>}
             </div>
             <div>
                <label className="label">Outros Custos (R$)</label>
                {editing ? <input className="input-field" type="number" step="0.01" value={form.otherCosts || ""} onChange={(e) => set("otherCosts", e.target.value)} />
                : <div className={detailStyles.value}>{product.otherCosts ? `R$ ${product.otherCosts.toFixed(2).replace(".", ",")}` : "—"}</div>}
             </div>
             <div>
                <label className="label">Custo Total (R$)</label>
                <div className={detailStyles.valueHighlight}>
                  R$ {(editing ? 
                    ((parseFloat(form.purchaseCost) || 0) + (parseFloat(form.packagingCost) || 0) + (parseFloat(form.shippingCost) || 0) + (parseFloat(form.otherCosts) || 0)) : 
                    (product.totalCost || 0)).toFixed(2).replace(".", ",")}
                </div>
             </div>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
          <div className={styles.grid2}>
            <div><label className="label">Valor Sugerido (R$)</label>
              {editing ? <input className="input-field" type="number" step="0.01" value={form.suggestedPrice || ""} onChange={(e) => set("suggestedPrice", e.target.value)} />
                : <div className={detailStyles.value}>{product.suggestedPrice ? `R$ ${product.suggestedPrice.toFixed(2).replace(".", ",")}` : "—"}</div>}</div>
            <div><label className="label">Valor de Venda (R$)</label>
              {editing ? <input className="input-field" type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
                : <div className={detailStyles.valueHighlight}>R$ {product.price.toFixed(2).replace(".", ",")}</div>}</div>
          </div>
        </div>

        {/* Estoque */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estoque</h2>
          <div className={styles.grid1}>
            <div><label className="label">Estoque Atual</label>
              <div className={`${detailStyles.valueHighlight} ${product.stock === 0 ? detailStyles.danger : ""}`}>{product.stock} unid.</div></div>
          </div>

          {isAdmin && (
            <button className={detailStyles.btnMovement} onClick={() => setShowMovement(!showMovement)}>
              {showMovement ? "Fechar movimentação" : "+ Registrar Movimentação"}
            </button>
          )}

          {showMovement && (
            <div className={detailStyles.movementForm}>
              <div className={styles.grid2}>
                <div><label className="label">Tipo</label>
                  <select className="input-field" value={movement.type} onChange={(e) => setMov("type", e.target.value)}>
                    <option value="ENTRY">Entrada</option>
                    <option value="EXIT">Saída</option>
                    <option value="ADJUSTMENT">Ajuste</option>
                    <option value="LOSS">Perda/Baixa</option>
                  </select></div>
                <div><label className="label">Quantidade</label>
                  <input className="input-field" type="number" min={movement.type === "ADJUSTMENT" ? "0" : "1"} value={movement.quantity} onChange={(e) => setMov("quantity", e.target.value)} /></div>
              </div>
              <div><label className="label">Motivo</label>
                <input className="input-field" value={movement.reason} onChange={(e) => setMov("reason", e.target.value)} placeholder="Ex: Venda, compra, inventário..." /></div>
              <div><label className="label">Observação</label>
                <input className="input-field" value={movement.obs} onChange={(e) => setMov("obs", e.target.value)} placeholder="Detalhe adicional..." /></div>
              <button className={styles.btnSave} onClick={handleMovement} disabled={movSaving}>
                {movSaving ? "Registrando..." : "Confirmar Movimentação"}
              </button>
            </div>
          )}
        </div>

        {/* Histórico */}
        {product.movements.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Últimas Movimentações</h2>
            <div className={detailStyles.movements}>
              {product.movements.map((m) => (
                <div key={m.id} className={detailStyles.movRow}>
                  <span className={`${detailStyles.movType} ${detailStyles["mov" + m.type]}`}>{MOVEMENT_LABELS[m.type]}</span>
                  <span className={detailStyles.movQty}>{m.type === "ADJUSTMENT" ? "=" : (m.type === "EXIT" || m.type === "LOSS" ? "-" : "+")}{m.quantity}</span>
                  <span className={detailStyles.movReason}>{m.reason || "—"}</span>
                  <span className={detailStyles.movUser}>{m.user.name}</span>
                  <span className={detailStyles.movDate}>{new Date(m.date).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDuplicateModal && (
        <div className={detailStyles.modalOverlay}>
          <div className={detailStyles.modalContent}>
            <h2 className={detailStyles.modalTitle}>Duplicar Produto</h2>
            {dupError && <div className={styles.error}>{dupError}</div>}
            <div>
              <label className="label">Novo SKU *</label>
              <input className="input-field" value={dupForm.sku} onChange={(e) => setDupForm({ ...dupForm, sku: e.target.value.toUpperCase() })} placeholder="Ex: C.PR.3E.EV.V2" />
            </div>
            <div>
              <label className="label">Nova Cor</label>
              <input className="input-field" value={dupForm.color} onChange={(e) => setDupForm({ ...dupForm, color: e.target.value })} placeholder="Ex: Marrom" />
            </div>
            <div>
              <label className="label">Novo Couro</label>
              <input className="input-field" value={dupForm.leather} onChange={(e) => setDupForm({ ...dupForm, leather: e.target.value })} placeholder="Ex: Floater" />
            </div>
            <div className={detailStyles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowDuplicateModal(false)}>Cancelar</button>
              <button className={styles.btnSave} onClick={handleDuplicate} disabled={dupSaving}>{dupSaving ? "Duplicando..." : "Confirmar Duplicação"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
