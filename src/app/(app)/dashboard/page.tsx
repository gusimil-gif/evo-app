"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import styles from "./dashboard.module.css";

const quickActions = [
  { href: "/orcamentos/novo", label: "Novo Orçamento", icon: "✦", color: "#000" },
  { href: "/produtos/novo", label: "Novo Produto", icon: "⊕", color: "#000" },
  { href: "/estoque", label: "Ver Estoque", icon: "◫", color: "#000" },
  { href: "/clientes/novo", label: "Novo Cliente", icon: "⊕", color: "#000" },
];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{greeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p className={styles.sub}>Bem-vindo ao sistema EVO</p>
        </div>
        {isAdmin && (
          <span className={styles.badge}>MASTER</span>
        )}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
        <div className={styles.quickGrid}>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className={styles.quickCard}>
              <span className={styles.quickIcon}>{action.icon}</span>
              <span className={styles.quickLabel}>{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Módulos</h2>
        <div className={styles.moduleGrid}>
          <Link href="/produtos" className={styles.moduleCard}>
            <span className={styles.moduleIcon}>▤</span>
            <div>
              <div className={styles.moduleName}>Produtos</div>
              <div className={styles.moduleDesc}>Cadastro e consulta de produtos</div>
            </div>
          </Link>
          <Link href="/estoque" className={styles.moduleCard}>
            <span className={styles.moduleIcon}>◫</span>
            <div>
              <div className={styles.moduleName}>Estoque</div>
              <div className={styles.moduleDesc}>Posição e movimentações</div>
            </div>
          </Link>
          <Link href="/orcamentos" className={styles.moduleCard}>
            <span className={styles.moduleIcon}>◈</span>
            <div>
              <div className={styles.moduleName}>Orçamentos</div>
              <div className={styles.moduleDesc}>Gere orçamentos em PDF</div>
            </div>
          </Link>
          <Link href="/pedidos" className={styles.moduleCard}>
            <span className={styles.moduleIcon}>◉</span>
            <div>
              <div className={styles.moduleName}>Pedidos</div>
              <div className={styles.moduleDesc}>Pedidos com assinatura eletrônica</div>
            </div>
          </Link>
          <Link href="/clientes" className={styles.moduleCard}>
            <span className={styles.moduleIcon}>◎</span>
            <div>
              <div className={styles.moduleName}>Clientes</div>
              <div className={styles.moduleDesc}>Cadastro de clientes</div>
            </div>
          </Link>
          <Link href="/parceiros" className={styles.moduleCard}>
            <span className={styles.moduleIcon}>◐</span>
            <div>
              <div className={styles.moduleName}>Parceiros</div>
              <div className={styles.moduleDesc}>Consignados e terceiros</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
