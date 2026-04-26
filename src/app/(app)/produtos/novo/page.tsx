"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./form.module.css";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    sku: "", name: "", type: "", color: "", leather: "",
    brand: "", description: "", price: "", costPrice: "",
    category: "", obs: "", active: true,
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.sku.trim()) { setError("SKU é obrigatório"); return; }
    setSaving(true);

    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
    };

    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/produtos/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao salvar produto");
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/produtos" className={styles.back}>← Produtos</Link>
        <h1 className={styles.title}>Novo Produto</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Identificação</h2>
          <div className={styles.grid2}>
            <div>
              <label className="label">SKU *</label>
              <input className="input-field" value={form.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} placeholder="Ex: M.PR.FL.VI" required />
            </div>
            <div>
              <label className="label">Nome Comercial</label>
              <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Mochila Slim Vicenza" />
            </div>
          </div>

          <div className={styles.grid3}>
            <div>
              <label className="label">Tipo</label>
              <input className="input-field" value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="Ex: Mochila" />
            </div>
            <div>
              <label className="label">Cor</label>
              <input className="input-field" value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Ex: Preto" />
            </div>
            <div>
              <label className="label">Couro</label>
              <input className="input-field" value={form.leather} onChange={(e) => set("leather", e.target.value)} placeholder="Ex: Floater" />
            </div>
          </div>

          <div className={styles.grid2}>
            <div>
              <label className="label">Marca</label>
              <input className="input-field" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Ex: Black Stone" />
            </div>
            <div>
              <label className="label">Categoria</label>
              <input className="input-field" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Ex: Mochilas" />
            </div>
          </div>

          <div>
            <label className="label">Descrição</label>
            <input className="input-field" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ex: Mochila Slim modelo Vicenza" />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Preços</h2>
          <div className={styles.grid2}>
            <div>
              <label className="label">Preço Padrão de Venda (R$)</label>
              <input className="input-field" type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <label className="label">Preço de Custo (R$) — Opcional</label>
              <input className="input-field" type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="0,00" />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Observações</h2>
          <textarea className="input-field" rows={3} value={form.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Observações opcionais..." style={{ resize: "vertical" }} />
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" id="active" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
            <label htmlFor="active" style={{ fontSize: "0.9rem", cursor: "pointer" }}>Produto ativo</label>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/produtos" className={styles.btnCancel}>Cancelar</Link>
          <button type="submit" className={styles.btnSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
