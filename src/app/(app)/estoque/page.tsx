"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./estoque.module.css";

interface Product {
  id: string; sku: string; name?: string; description?: string; type?: string; color?: string;
  stock: number; price: number; active: boolean;
  purchaseCost?: number; packagingCost?: number; shippingCost?: number; totalCost?: number;
}

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "zero">("all");

  useEffect(() => {
    fetch("/api/produtos?active=true")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.type ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.color ?? "").toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ? true :
      filter === "zero" ? p.stock === 0 :
      filter === "low" ? p.stock > 0 && p.stock <= 3 : true;

    return matchSearch && matchFilter;
  });

  const total = products.reduce((s, p) => s + p.stock, 0);
  const zeros = products.filter((p) => p.stock === 0).length;
  const low = products.filter((p) => p.stock > 0 && p.stock <= 3).length;

  const handleExportCSV = () => {
    const headers = [
      "SKU", "Descrição", "Tipo", "Cor", "Estoque",
      "Custo do Produto", "Custo Embalagem", "Custo do Frete", "Custo Total", "Valor de Venda"
    ];

    const rows = filtered.map(p => {
      const name = p.description || p.name || p.sku;
      return [
        p.sku,
        `"${name.replace(/"/g, '""')}"`,
        p.type || "",
        p.color || "",
        p.stock,
        (p.purchaseCost || 0).toFixed(2).replace('.', ','),
        (p.packagingCost || 0).toFixed(2).replace('.', ','),
        (p.shippingCost || 0).toFixed(2).replace('.', ','),
        (p.totalCost || 0).toFixed(2).replace('.', ','),
        p.price.toFixed(2).replace('.', ',')
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(r => r.join(";"))
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventario-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Estoque</h1>
          <p className={styles.sub}>Posição atual de todos os produtos ativos</p>
        </div>
        <button className={styles.btnExport} onClick={handleExportCSV}>Exportar CSV</button>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kpiValue}>{total}</div>
          <div className={styles.kpiLabel}>Total em estoque</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiValue}>{products.length}</div>
          <div className={styles.kpiLabel}>Produtos ativos</div>
        </div>
        <div className={`${styles.kpi} ${zeros > 0 ? styles.kpiDanger : ""}`}>
          <div className={styles.kpiValue}>{zeros}</div>
          <div className={styles.kpiLabel}>Sem estoque</div>
        </div>
        <div className={`${styles.kpi} ${low > 0 ? styles.kpiWarn : ""}`}>
          <div className={styles.kpiValue}>{low}</div>
          <div className={styles.kpiLabel}>Estoque baixo (≤3)</div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <input type="search" className="input-field" style={{ maxWidth: 320 }}
          placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className={styles.filterBtns}>
          {([["all", "Todos"], ["zero", "Sem Estoque"], ["low", "Estoque Baixo"]] as const).map(([val, label]) => (
            <button key={val} className={`${styles.filterBtn} ${filter === val ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>SKU</span>
            <span>Descrição</span>
            <span>Tipo / Cor</span>
            <span className={styles.right}>Preço</span>
            <span className={styles.right}>Qtd</span>
            <span className={styles.right}>Ação</span>
          </div>
          {filtered.length === 0 ? (
            <div className={styles.empty}>Nenhum produto encontrado.</div>
          ) : filtered.map((p) => (
            <div key={p.id} className={styles.tableRow}>
              <span className={styles.sku}>{p.sku}</span>
              <span className={styles.name}>{p.description || p.name || p.sku}</span>
              <span className={styles.muted}>{[p.type, p.color].filter(Boolean).join(" - ")}</span>
              <span className={styles.right}>{p.price > 0 ? `R$ ${p.price.toFixed(2).replace(".", ",")}` : "—"}</span>
              <span className={`${styles.right} ${styles.stockQty} ${p.stock === 0 ? styles.stockZero : p.stock <= 3 ? styles.stockLow : ""}`}>
                {p.stock}
              </span>
              <span className={styles.right}>
                <Link href={`/produtos/${p.id}`} className={styles.btnDetail}>Ver</Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
