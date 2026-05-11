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
      .then((r) => r.json())
      .then((d) => { 
        setClientes(Array.isArray(d) ? d : []); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error("Erro ao carregar clientes:", err);
        setLoading(false);
      });
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

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Deseja realmente excluir o cliente ${name}?`)) return;
    
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    load();
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
              <div className={styles.actions}>
                {c.phone && (
                  <a 
                    href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.btnWhatsApp} 
                    onClick={(e) => e.stopPropagation()}
                    title="Chamar no WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  </a>
                )}
                <button 
                  className={styles.btnDelete} 
                  onClick={(e) => handleDelete(e, c.id, c.name)}
                  title="Excluir cliente"
                >
                  🗑
                </button>
                <span className={styles.arrow}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
