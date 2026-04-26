"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./produtos.module.css";

interface Product {
  id: string;
  sku: string;
  name?: string;
  type?: string;
  color?: string;
  leather?: string;
  brand?: string;
  price: number;
  stock: number;
  active: boolean;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/produtos?q=${encodeURIComponent(debouncedSearch)}`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Produtos</h1>
          <p className={styles.sub}>{products.length} itens cadastrados</p>
        </div>
        <Link href="/produtos/novo" className={styles.btnNew}>+ Novo</Link>
      </div>

      <div className={styles.searchBar}>
        <input
          type="search"
          className="input-field"
          placeholder="Buscar por SKU, nome, tipo, cor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p>Nenhum produto encontrado.</p>
          <Link href="/produtos/novo" className={styles.btnNew}>Cadastrar primeiro produto</Link>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>SKU</span>
            <span>Descrição</span>
            <span>Tipo / Cor</span>
            <span className={styles.right}>Preço</span>
            <span className={styles.right}>Estoque</span>
            <span className={styles.right}>Status</span>
          </div>
          {products.map((p) => (
            <Link href={`/produtos/${p.id}`} key={p.id} className={styles.tableRow}>
              <span className={styles.sku}>{p.sku}</span>
              <span className={styles.name}>{p.name || p.sku}</span>
              <span className={styles.muted}>{[p.type, p.color].filter(Boolean).join(" · ")}</span>
              <span className={styles.right}>
                {p.price > 0 ? formatCurrency(p.price) : "—"}
              </span>
              <span className={`${styles.right} ${p.stock === 0 ? styles.stockZero : ""}`}>
                {p.stock}
              </span>
              <span className={styles.right}>
                <span className={p.active ? styles.statusActive : styles.statusInactive}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
