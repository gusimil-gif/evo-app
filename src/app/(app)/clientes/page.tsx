"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./clientes.module.css";

interface Cliente { id: string; name: string; phone?: string; email?: string; document?: string; }

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", document: "", address: "", obs: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);

  const load = () => {
    fetch(`/api/clientes?q=${encodeURIComponent(debounced)}`)
      .then((r) => r.json()).then((d) => { setClientes(d); setLoading(false); });
  };

  useEffect(() => { setLoading(true); load(); }, [debounced]);

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/clientes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", phone: "", email: "", document: "", address: "", obs: "" });
    setLoading(true); load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.sub}>{clientes.length} clientes cadastrados</p>
        </div>
        <button className={styles.btnNew} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "+ Novo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className={styles.form}>
          <h2 className={styles.formTitle}>Novo Cliente</h2>
          <div className={styles.grid2}>
            <div><label className="label">Nome *</label><input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
            <div><label className="label">CPF/CNPJ</label><input className="input-field" value={form.document} onChange={(e) => set("document", e.target.value)} /></div>
          </div>
          <div className={styles.grid2}>
            <div><label className="label">Telefone/WhatsApp</label><input className="input-field" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><label className="label">E-mail</label><input className="input-field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          </div>
          <div><label className="label">Endereço</label><input className="input-field" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div><label className="label">Observações</label><input className="input-field" value={form.obs} onChange={(e) => set("obs", e.target.value)} /></div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className={styles.btnSave} disabled={saving}>{saving ? "Salvando..." : "Salvar Cliente"}</button>
          </div>
        </form>
      )}

      <input type="search" className="input-field" style={{ maxWidth: 400 }}
        placeholder="Buscar por nome, telefone, e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? <div className={styles.loading}>Carregando...</div> : (
        <div className={styles.list}>
          {clientes.length === 0 ? (
            <div className={styles.empty}>Nenhum cliente encontrado.</div>
          ) : clientes.map((c) => (
            <Link href={`/clientes/${c.id}`} key={c.id} className={styles.card}>
              <div className={styles.avatar}>{c.name[0]}</div>
              <div className={styles.info}>
                <div className={styles.name}>{c.name}</div>
                <div className={styles.meta}>{[c.phone, c.email].filter(Boolean).join(" · ")}</div>
              </div>
              <span className={styles.arrow}>›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
