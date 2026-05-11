"use client";

import { useState, useEffect } from "react";
import styles from "./relatorios.module.css";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

export default function RelatoriosPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/relatorios/stats?t=${Date.now()}`).then(r => r.json()).then(d => {
      setStats(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className={styles.loading}>Gerando indicadores estratégicos...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel Estratégico</h1>
        <p className={styles.sub}>Visão geral da performance da EVO</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Custo Total (Estoque)</div>
          <div className={styles.statValue}>{formatCurrency(stats.stockTotalCost)}</div>
          <div className={styles.statFooter}>Soma de custo total x quantidade</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Valor Potencial (Venda)</div>
          <div className={styles.statValue} style={{ color: "#2563eb" }}>{formatCurrency(stats.stockSaleValue)}</div>
          <div className={styles.statFooter}>Soma de preço de venda x quantidade</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Faturamento Total</div>
          <div className={styles.statValue} style={{ color: "#16a34a" }}>{formatCurrency(stats.revenue)}</div>
          <div className={styles.statFooter}>Apenas orçamentos validados</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total de Pedidos</div>
          <div className={styles.statValue}>{stats.totalOrders}</div>
          <div className={styles.statFooter}>Vendas concretizadas</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Base de Clientes</div>
          <div className={styles.statValue}>{stats.customersCount}</div>
          <div className={styles.statFooter}>Clientes cadastrados</div>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.infoBox}>
          <h3>📈 Insights de Negócio</h3>
          <p>O valor médio por pedido (Ticket Médio) atual é de <strong>{formatCurrency(stats.revenue / (stats.totalOrders || 1))}</strong>.</p>
          <p>Seu estoque representa <strong>{((stats.stockSaleValue / (stats.revenue || 1)) * 100).toFixed(1)}%</strong> do seu faturamento bruto atual, considerando os preços de venda.</p>
        </div>

        <div className={styles.infoBox}>
          <h3>💡 Recomendações</h3>
          <ul>
            <li>Revise produtos com estoque parado há mais de 30 dias.</li>
            <li>Identifique os 5 clientes com maior volume de compras para ações de fidelidade.</li>
            <li>Garanta que todos os custos (frete, embalagem) estejam atualizados nos produtos.</li>
          </ul>
        </div>
      </div>

      <div className={styles.detailsGrid} style={{ marginTop: '1.5rem' }}>
        <div className={styles.infoBox}>
          <h3>🔥 Top 5 Mais Vendidos (Curva A)</h3>
          <ul className={styles.rankingList}>
            {stats.topSoldProducts?.map((p: any, i: number) => (
              <li key={p.sku}>
                <span className={styles.rankNum}>{i + 1}º</span>
                <span className={styles.rankName}>{p.name} <small>({p.sku})</small></span>
                <span className={styles.rankQty}>{p.quantity} unid.</span>
              </li>
            ))}
            {(!stats.topSoldProducts || stats.topSoldProducts.length === 0) && (
              <p className={styles.emptyMsg}>Nenhuma venda registrada ainda.</p>
            )}
          </ul>
        </div>

        <div className={styles.infoBox}>
          <h3>📦 Maior Estoque Parado</h3>
          <ul className={styles.rankingList}>
            {stats.topStockProducts?.map((p: any, i: number) => (
              <li key={p.sku}>
                <span className={styles.rankNum}>{i + 1}º</span>
                <span className={styles.rankName}>{p.name} <small>({p.sku})</small></span>
                <span className={styles.rankQty}>{p.stock} unid.</span>
              </li>
            ))}
            {(!stats.topStockProducts || stats.topStockProducts.length === 0) && (
              <p className={styles.emptyMsg}>Nenhum estoque registrado ainda.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
