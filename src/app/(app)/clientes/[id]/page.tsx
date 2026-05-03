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
            {editing ? <input className="input-field" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /> : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {cliente.phone || "—"}
                {cliente.phone && (
                  <a href={`https://wa.me/55${cliente.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", display: "flex", alignItems: "center", textDecoration: "none" }} title="Chamar no WhatsApp">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}</div>
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
