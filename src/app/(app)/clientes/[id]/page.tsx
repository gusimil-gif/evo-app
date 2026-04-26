"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Cliente {
  id: string; name: string; phone?: string; email?: string;
  document?: string; address?: string; obs?: string;
  budgets: Array<{ id: string; date: string; status: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho", APPROVED: "Aprovado", SIGNED: "Validado/Pedido", CANCELLED: "Cancelado"
};

export default function ClienteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/clientes/${id}`).then((r) => r.json()).then((d) => { setCliente(d); setForm(d); });
  }, [id]);

  const set = (f: string, v: string) => setForm((p: any) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/clientes/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, document: form.document, address: form.address, obs: form.obs }),
    });
    setSaving(false);
    setEditing(false);
    const data = await fetch(`/api/clientes/${id}`).then((r) => r.json());
    setCliente(data);
  };

  if (!cliente) return <div style={{ padding: "2rem", color: "var(--muted)" }}>Carregando...</div>;

  return (
    <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <Link href="/clientes" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>← Clientes</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 600 }}>{cliente.name}</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Editar</button>
                <Link href={`/orcamentos/novo?clienteId=${cliente.id}`} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>+ Orçamento</Link>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(false)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>{saving ? "Salvando..." : "Salvar"}</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="premium-card" style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div><label className="label">Nome</label>
            {editing ? <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} /> : <div>{cliente.name}</div>}</div>
          <div><label className="label">CPF/CNPJ</label>
            {editing ? <input className="input-field" value={form.document || ""} onChange={(e) => set("document", e.target.value)} /> : <div>{cliente.document || "—"}</div>}</div>
          <div><label className="label">Telefone</label>
            {editing ? <input className="input-field" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /> : <div>{cliente.phone || "—"}</div>}</div>
          <div><label className="label">E-mail</label>
            {editing ? <input className="input-field" value={form.email || ""} onChange={(e) => set("email", e.target.value)} /> : <div>{cliente.email || "—"}</div>}</div>
        </div>
        <div><label className="label">Endereço</label>
          {editing ? <input className="input-field" value={form.address || ""} onChange={(e) => set("address", e.target.value)} /> : <div>{cliente.address || "—"}</div>}</div>
        <div><label className="label">Observações</label>
          {editing ? <textarea className="input-field" rows={2} value={form.obs || ""} onChange={(e) => set("obs", e.target.value)} /> : <div>{cliente.obs || "—"}</div>}</div>
      </div>

      {cliente.budgets.length > 0 && (
        <div className="premium-card">
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Orçamentos</h2>
          {cliente.budgets.map((b) => (
            <Link href={`/orcamentos/${b.id}`} key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border)", textDecoration: "none", color: "var(--foreground)" }}>
              <span style={{ fontSize: "0.85rem" }}>#{b.id.slice(-6).toUpperCase()}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{new Date(b.date).toLocaleDateString("pt-BR")}</span>
              <span style={{ fontSize: "0.75rem" }}>{STATUS_LABELS[b.status]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
