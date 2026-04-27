"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import styles from "./validar.module.css";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

export default function ValidarPublicPage() {
  const { id } = useParams();
  const [orc, setOrc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch(`/api/public/orcamentos/${id}`).then(r => r.json()).then(d => {
      setOrc(d);
      setLoading(false);
    });
  }, [id]);

  const handleValidar = async () => {
    if (!name.trim()) { alert("Por favor, informe seu nome completo."); return; }
    setValidating(true);
    const res = await fetch(`/api/public/orcamentos/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setDone(true);
    } else {
      alert("Erro ao validar orçamento. Tente novamente.");
    }
    setValidating(false);
  };

  if (loading) return <div className={styles.loading}>Carregando Orçamento...</div>;
  if (!orc) return <div className={styles.loading}>Orçamento não encontrado.</div>;

  if (done) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h1>Orçamento Validado!</h1>
          <p>Obrigado, <strong>{name}</strong>. Nossa equipe já foi notificada e dará andamento ao seu pedido.</p>
        </div>
      </div>
    );
  }

  const total = orc.items.reduce((s: number, i: any) => s + i.total, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image 
          src="/logo-evo-dark.png" 
          alt="EVO" 
          className={styles.logo} 
          width={100} 
          height={100} 
          style={{ objectFit: 'contain' }}
          priority
        />
        <div className={styles.badge}>VALIDE SEU PEDIDO</div>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Olá, {orc.customer.name}</h1>
          <p>Confira os detalhes do seu orçamento abaixo e confirme para iniciarmos a produção.</p>
        </div>

        <div className={styles.budgetCard}>
          <div className={styles.budgetHeader}>
            <span>Orçamento #{orc.id.slice(-6).toUpperCase()}</span>
            <span>{new Date(orc.date).toLocaleDateString("pt-BR")}</span>
          </div>

          <div className={styles.itemsList}>
            {orc.items.map((it: any) => (
              <div key={it.id} className={styles.itemRow}>
                <div className={styles.itInfo}>
                  <div className={styles.itName}>{it.description || it.sku}</div>
                  <div className={styles.itSub}>{it.color} — {it.quantity} unidade(s)</div>
                </div>
                <div className={styles.itPrice}>{formatCurrency(it.total)}</div>
              </div>
            ))}
          </div>

          <div className={styles.totalRow}>
            <span>Total Geral</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className={styles.validationPanel}>
          <h2>Confirmar Validação</h2>
          <p>Ao validar, você concorda com os itens e valores descritos acima.</p>
          <div className={styles.inputGroup}>
            <label>Nome Completo do Responsável</label>
            <input 
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>
          <button 
            className={styles.btnValidate}
            onClick={handleValidar}
            disabled={validating || orc.status === 'SIGNED'}
          >
            {validating ? "Validando..." : orc.status === 'SIGNED' ? "Já Validado" : "✓ Confirmar e Validar Pedido"}
          </button>
          <p className={styles.lgpdNotice}>
            Ao confirmar, você concorda com o processamento dos seus dados pessoais para fins exclusivos de faturamento e entrega deste pedido, em conformidade com a LGPD.
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        EVO — Artigos em Couro Premium Autênticos
      </footer>
    </div>
  );
}
