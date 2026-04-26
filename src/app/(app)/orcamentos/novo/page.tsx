"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./novo.module.css";

const PAYMENT_OPTIONS = [
  "10% entrada + 90% na entrega",
  "30% entrada + 70% na entrega",
  "50% entrada + 50% na entrega",
  "60% entrada + 40% na entrega",
  "Outro",
];

interface Cliente { id: string; name: string; phone?: string; }
interface Product { id: string; sku: string; name?: string; price: number; stock: number; color?: string; type?: string; }
interface Item {
  productId: string;
  sku: string;
  name: string; // nome visual no frontend
  description: string; // descrição para o banco de dados
  color: string;
  defaultPrice: number;
  appliedPrice: string;
  quantity: string;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
};

function NovoOrcamentoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preClienteId = searchParams.get("clienteId") ?? "";

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clienteId, setClienteId] = useState(preClienteId);
  const [paymentCond, setPaymentCond] = useState(PAYMENT_OPTIONS[0]);
  const [customPayment, setCustomPayment] = useState("");
  const [obs, setObs] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [prodSearch, setProdSearch] = useState("");
  const [prodResults, setProdResults] = useState<Product[]>([]);
  const [showProdSearch, setShowProdSearch] = useState(false);

  useEffect(() => {
    fetch("/api/clientes").then((r) => r.json()).then(setClientes);
    fetch("/api/produtos?active=true").then((r) => r.json()).then(setProducts);
  }, []);

  useEffect(() => {
    const q = prodSearch.toLowerCase();
    if (!q) {
      setProdResults(products.slice(0, 50));
    } else {
      setProdResults(products.filter((p) =>
        p.sku.toLowerCase().includes(q) || 
        (p.name ?? "").toLowerCase().includes(q) || 
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.type ?? "").toLowerCase().includes(q) ||
        (p.color ?? "").toLowerCase().includes(q)
      ).slice(0, 50));
    }
  }, [prodSearch, products]);

  const addItem = (p: Product) => {
    setItems([...items, { 
      productId: p.id, 
      sku: p.sku, 
      name: p.name || p.sku, 
      description: p.name || p.sku, 
      color: p.color || "",
      defaultPrice: p.price, 
      appliedPrice: p.price.toString(), 
      quantity: "1" 
    }]);
    setShowProdSearch(false);
    setProdSearch("");
  };

  const updateItem = (idx: number, field: keyof Item, value: any) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const total = items.reduce((s, it) => s + (parseFloat(it.appliedPrice) || 0) * (parseInt(it.quantity) || 0), 0);
  const subtotal = items.reduce((s, it) => s + it.defaultPrice * (parseInt(it.quantity) || 0), 0);
  const discount = subtotal - total;

  const handleSubmit = async () => {
    setError("");
    if (!clienteId) { setError("Selecione um cliente"); return; }
    if (items.length === 0) { setError("Adicione pelo menos um item"); return; }
    setSaving(true);

    try {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: clienteId,
          paymentCond: paymentCond === "Outro" ? customPayment : paymentCond,
          obs,
          items: items.map((it) => ({
            productId: it.productId,
            sku: it.sku,
            description: it.description, // Mapeia corretamente para o banco
            color: it.color,
            defaultPrice: it.defaultPrice,
            appliedPrice: parseFloat(it.appliedPrice) || 0,
            quantity: parseInt(it.quantity) || 0,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/orcamentos/${data.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar orçamento");
        setSaving(false);
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão ao salvar");
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/orcamentos" className={styles.back}>← Orçamentos</Link>
        <h1 className={styles.title}>Novo Orçamento</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Cliente</h2>
        <select className="input-field" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecione um cliente...</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ""}</option>)}
        </select>
        <div style={{ marginTop: "0.5rem" }}>
          <Link href="/clientes/novo" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>+ Cadastrar novo cliente</Link>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Itens do Orçamento</h2>

        {items.length > 0 && (
          <div className={styles.itemsTable} style={{ marginBottom: '1.5rem' }}>
            <div className={styles.tableHead}>
              <span>Produto</span>
              <span>Cor</span>
              <span className={styles.right}>Preço Padrão</span>
              <span className={styles.right}>Preço Praticado</span>
              <span className={styles.right}>Qtd</span>
              <span className={styles.right}>Total</span>
              <span></span>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className={styles.tableRow}>
                <div className={styles.prodInfo}>
                  <span className={styles.sku}>{item.sku}</span>
                  <span className={styles.name}>{item.name}</span>
                </div>
                <div className={styles.colorVal}>{item.color || "—"}</div>
                <div className={styles.right}>{formatCurrency(item.defaultPrice)}</div>
                <div className={styles.priceInputWrapper}>
                  <span className={styles.currencyPrefix}>R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className={styles.miniInput} 
                    value={item.appliedPrice} 
                    onChange={(e) => updateItem(idx, "appliedPrice", e.target.value)} 
                    style={{ width: '100px' }}
                  />
                </div>
                <div className={styles.right}>
                  <input 
                    type="number" 
                    className={styles.miniInput} 
                    style={{ width: '60px' }}
                    value={item.quantity} 
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)} 
                  />
                </div>
                <div className={styles.right} style={{ fontWeight: 700 }}>
                  {formatCurrency((parseFloat(item.appliedPrice) || 0) * (parseInt(item.quantity) || 0))}
                </div>
                <button className={styles.btnRemove} onClick={() => setItems(items.filter((_, i) => i !== idx))}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.prodSearch}>
          <div className={styles.searchWrapper}>
            <input 
              className="input-field" 
              placeholder="Clique para ver produtos ou digite para filtrar..."
              value={prodSearch} 
              onChange={(e) => setProdSearch(e.target.value)}
              onFocus={() => setShowProdSearch(true)}
            />
            {showProdSearch && (
              <button className={styles.btnCloseDropdown} onClick={() => setShowProdSearch(false)}>Fechar Lista ✕</button>
            )}
          </div>
          
          {showProdSearch && (
            <div className={styles.prodDropdown}>
              {prodResults.length === 0 ? (
                <div className={styles.noResults}>Nenhum produto encontrado.</div>
              ) : (
                prodResults.map((p) => (
                  <button key={p.id} className={styles.prodOption} onClick={() => addItem(p)}>
                    <div className={styles.prodOptionMain}>
                      <span className={styles.prodOptionSku}>{p.sku}</span>
                      <span className={styles.prodOptionName}>
                        {p.name || p.sku} 
                        {p.color ? ` — ${p.color}` : ""}
                      </span>
                    </div>
                    <div className={styles.prodOptionMeta}>
                      <span className={styles.prodOptionPrice}>R$ {p.price.toFixed(2).replace(".", ",")}</span>
                      <span className={`${styles.prodOptionStock} ${p.stock <= 0 ? styles.outOfStock : ""}`}>
                        Estoque: {p.stock}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.totals} style={{ marginTop: '2rem' }}>
            {discount > 0 && (
              <div className={styles.totalRow}>
                <span>Desconto concedido</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.totalFinal}`}>
              <span>TOTAL FINAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Condições de Pagamento</h2>
        <div className={styles.paymentOpts}>
          {PAYMENT_OPTIONS.map((opt) => (
            <button key={opt} className={`${styles.payOpt} ${paymentCond === opt ? styles.payOptActive : ""}`}
              onClick={() => setPaymentCond(opt)}>{opt}</button>
          ))}
        </div>
        {paymentCond === "Outro" && (
          <textarea className="input-field" rows={2} style={{ marginTop: "0.75rem" }}
            placeholder="Descreva as condições de pagamento..."
            value={customPayment} onChange={(e) => setCustomPayment(e.target.value)} />
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Observações</h2>
        <textarea className="input-field" rows={3} value={obs} onChange={(e) => setObs(e.target.value)}
          placeholder="Observações que aparecerão no orçamento..." style={{ resize: "vertical" }} />
      </div>

      <div className={styles.actions}>
        <Link href="/orcamentos" className={styles.btnCancel}>Cancelar</Link>
        <button className={styles.btnSave} onClick={handleSubmit} disabled={saving}>
          {saving ? "Salvando..." : "Criar Orçamento"}
        </button>
      </div>
    </div>
  );
}

export default function NovoOrcamentoPage() {
  return <Suspense><NovoOrcamentoForm /></Suspense>;
}
