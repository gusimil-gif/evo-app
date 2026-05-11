"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./orcamentos.module.css";

interface Orcamento {
  id: string; date: string; status: string;
  customer: { name: string };
  items: Array<{ total: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho", APPROVED: "Aprovado", SIGNED: "Assinado/Pedido", CANCELLED: "Cancelado"
};
const STATUS_CLASS: Record<string, string> = {
  DRAFT: "statusDraft", APPROVED: "statusApproved", SIGNED: "statusSigned", CANCELLED: "statusCancelled"
};

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orcamentos")
      .then((r) => r.json())
      .then((d) => { 
        setOrcamentos(Array.isArray(d) ? d : []); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error("Erro ao carregar orçamentos:", err);
        setLoading(false);
      });
  }, []);

  const total = (orc: Orcamento) => orc.items.reduce((s, i) => s + i.total, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orçamentos</h1>
          <p className={styles.sub}>{orcamentos.length} orçamentos emitidos</p>
        </div>
        <Link href="/orcamentos/novo" className={styles.btnNew}>+ Novo</Link>
      </div>

      {loading ? <div className={styles.loading}>Carregando...</div> : orcamentos.length === 0 ? (
        <div className={styles.empty}>
          <p>Nenhum orçamento ainda.</p>
          <Link href="/orcamentos/novo" className={styles.btnNew}>Criar primeiro orçamento</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orcamentos.map((o) => (
            <Link href={`/orcamentos/${o.id}`} key={o.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={styles.orcNum}>#{o.id.slice(-6).toUpperCase()}</div>
                <div className={styles.orcDate}>{new Date(o.date).toLocaleDateString("pt-BR")}</div>
              </div>
              <div className={styles.cardMid}>
                <div className={styles.orcCliente}>{o.customer.name}</div>
                <div className={styles.orcItems}>{o.items.length} {o.items.length === 1 ? "item" : "itens"}</div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.orcTotal}>R$ {total(o).toFixed(2).replace(".", ",")}</div>
                <span className={`${styles.status} ${styles[STATUS_CLASS[o.status]]}`}>
                  {STATUS_LABELS[o.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
