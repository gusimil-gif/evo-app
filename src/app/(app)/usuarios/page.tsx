"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User { id: string; name: string; email: string; role: string; }

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "COMMON" });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/usuarios").then((r) => r.json()).then((d) => { setUsers(d); setLoading(false); });
  useEffect(load, []);
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/usuarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", email: "", password: "", role: "COMMON" });
    load();
  };

  const ROLES: Record<string, string> = { MASTER: "Master", ADMIN: "Admin", COMMON: "Comum" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 600 }}>Usuários</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 2 }}>Gestão de acessos</p>
        </div>
        <button className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.875rem" }} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "+ Novo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>Novo Usuário</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div><label className="label">Nome</label><input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
            <div><label className="label">E-mail</label><input className="input-field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
            <div><label className="label">Senha</label><input className="input-field" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required /></div>
            <div><label className="label">Perfil</label>
              <select className="input-field" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="COMMON">Comum</option>
                <option value="ADMIN">Admin</option>
                <option value="MASTER">Master</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" className="btn-secondary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.875rem" }} onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.875rem" }} disabled={saving}>{saving ? "Salvando..." : "Criar Usuário"}</button>
          </div>
        </form>
      )}

      {loading ? <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>Carregando...</p> : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--foreground)", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>{u.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{u.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{u.email}</div>
              </div>
              <span style={{ padding: "0.15rem 0.6rem", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700, background: u.role === "MASTER" ? "#111" : u.role === "ADMIN" ? "#dbeafe" : "#f5f5f5", color: u.role === "MASTER" ? "white" : u.role === "ADMIN" ? "#1d4ed8" : "#737373" }}>
                {ROLES[u.role]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
