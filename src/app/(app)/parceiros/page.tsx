"use client";

import { useState, useEffect } from "react";
import styles from "./parceiros.module.css";

interface Partner {
  id: string; name: string; type: string; phone?: string; email?: string;
  document?: string; address?: string; obs?: string;
}

export default function ParceirosPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Partner>>({ type: "FORNECEDOR" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/parceiros")
      .then(r => r.json())
      .then(d => { 
        if (Array.isArray(d)) {
          setPartners(d); 
        } else {
          console.error("Resposta inválida da API:", d);
          setPartners([]);
        }
        setLoading(false); 
      })
      .catch(err => {
        console.error("Erro ao carregar parceiros:", err);
        setPartners([]);
        setLoading(false);
      });
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (!form.name) return alert("Nome é obrigatório");
    setSaving(true);
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/parceiros/${editingId}` : "/api/parceiros";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    
    setSaving(false);
    setShowNew(false);
    setEditingId(null);
    setForm({ type: "FORNECEDOR" });
    load();
  };

  const handleEdit = (p: Partner) => {
    setForm(p);
    setEditingId(p.id);
    setShowNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este parceiro?")) return;
    await fetch(`/api/parceiros/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Parceiros</h1>
          <p className={styles.sub}>{partners.length} parceiros cadastrados</p>
        </div>
        <button className={styles.btnNew} onClick={() => { setShowNew(true); setEditingId(null); setForm({ type: "FORNECEDOR" }); }}>+ Novo</button>
      </div>

      {showNew && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editingId ? "Editar Parceiro" : "Novo Parceiro"}</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className="label">Nome / Razão Social</label>
                <input className="input-field" value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label className="label">Tipo</label>
                <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="FORNECEDOR">Fornecedor</option>
                  <option value="OFICINA">Oficina / Costura</option>
                  <option value="LOGISTICA">Logística / Entrega</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className="label">Telefone</label>
                <input className="input-field" value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label className="label">E-mail</label>
                <input className="input-field" value={form.email || ""} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label className="label">CPF / CNPJ</label>
                <input className="input-field" value={form.document || ""} onChange={e => setForm({...form, document: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label className="label">Endereço</label>
                <input className="input-field" value={form.address || ""} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </div>
            <div className={styles.field} style={{ marginTop: "1rem" }}>
              <label className="label">Observações</label>
              <textarea className="input-field" rows={2} value={form.obs || ""} onChange={e => setForm({...form, obs: e.target.value})} />
            </div>
            <div className={styles.modalActions}>
              <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar Parceiro"}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className={styles.loading}>Carregando...</div> : partners.length === 0 ? (
        <div className={styles.empty}>Nenhum parceiro cadastrado ainda.</div>
      ) : (
        <div className={styles.list}>
          {partners.map(p => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{p.name}</span>
                  <span className={`${styles.badge} ${styles['badge'+p.type]}`}>{p.type}</span>
                </div>
                <div className={styles.details}>
                  {p.phone && <span>📞 {p.phone}</span>}
                  {p.email && <span>✉ {p.email}</span>}
                </div>
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => handleEdit(p)} className={styles.btnAction}>Editar</button>
                <button onClick={() => handleDelete(p.id)} className={styles.btnDelete}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
