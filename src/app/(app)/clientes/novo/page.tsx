"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function NovoClienteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/clientes";
  const [form, setForm] = useState({ name: "", phone: "", email: "", document: "", address: "", obs: "" });
  const [saving, setSaving] = useState(false);
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/clientes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) router.push(redirect);
    else setSaving(false);
  };

  return (
    <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <Link href="/clientes" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>← Clientes</Link>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 600, marginTop: "0.5rem" }}>Novo Cliente</h1>
      </div>
      <form onSubmit={handleSubmit} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div><label className="label">Nome *</label><input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
          <div><label className="label">CPF/CNPJ</label><input className="input-field" value={form.document} onChange={(e) => set("document", e.target.value)} /></div>
          <div><label className="label">Telefone/WhatsApp</label><input className="input-field" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="label">E-mail</label><input className="input-field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        </div>
        <div><label className="label">Endereço</label><input className="input-field" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
        <div><label className="label">Observações</label><textarea className="input-field" rows={2} value={form.obs} onChange={(e) => set("obs", e.target.value)} /></div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Link href="/clientes" className="btn-secondary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.875rem" }}>Cancelar</Link>
          <button type="submit" className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.875rem" }} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NovoClientePage() {
  return <Suspense><NovoClienteForm /></Suspense>;
}
