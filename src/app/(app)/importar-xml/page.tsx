"use client";

import { useState } from "react";
import styles from "./import.module.css";

interface XMLItem {
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export default function ImportXMLPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ nfeNumber: string; issuer: string; items: XMLItem[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ updated: number; errors: string[] } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setData(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import/xml", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao processar arquivo");
      }
    } catch (err) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!data) return;
    if (!confirm(`Confirmar importação de ${data.items.length} itens?`)) return;

    setImporting(true);
    try {
      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: data.items, 
          obs: `Importação NF-e #${data.nfeNumber} - ${data.issuer}` 
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json);
        setData(null);
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao importar");
      }
    } catch (err) {
      alert("Erro de conexão");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Importar XML (NF-e)</h1>
        <p className={styles.sub}>Atualize seu estoque e custos automaticamente via nota fiscal</p>
      </div>

      {!data && !result && (
        <div className={styles.uploadCard}>
          <div className={styles.uploadIcon}>📄</div>
          <h2>Selecione o arquivo XML</h2>
          <p>Arraste ou clique para selecionar a NF-e (.xml)</p>
          <form onSubmit={handleUpload} className={styles.form}>
            <input 
              type="file" 
              accept=".xml" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className={styles.fileInput}
            />
            <button 
              type="submit" 
              className={styles.btnUpload} 
              disabled={!file || loading}
            >
              {loading ? "Processando..." : "Carregar Arquivo"}
            </button>
          </form>
        </div>
      )}

      {data && (
        <div className={styles.dataCard}>
          <div className={styles.dataHeader}>
            <div>
              <h3>NF-e #{data.nfeNumber}</h3>
              <p>Emitente: <strong>{data.issuer}</strong></p>
            </div>
            <div className={styles.dataActions}>
              <button className={styles.btnCancel} onClick={() => setData(null)}>Cancelar</button>
              <button className={styles.btnConfirm} onClick={handleConfirm} disabled={importing}>
                {importing ? "Importando..." : "Confirmar Importação"}
              </button>
            </div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>SKU (XML)</span>
              <span>Descrição no XML</span>
              <span className={styles.right}>Qtd</span>
              <span className={styles.right}>V. Unit</span>
              <span className={styles.right}>Total</span>
            </div>
            {data.items.map((item, idx) => (
              <div key={idx} className={styles.tableRow}>
                <span className={styles.sku}>{item.sku}</span>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.right}>{item.quantity} {item.unit}</span>
                <span className={styles.right}>R$ {item.price.toFixed(2)}</span>
                <span className={styles.right}>R$ {item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.resultIcon}>✅</div>
            <div>
              <h3>Importação Concluída</h3>
              <p>{result.updated} produtos atualizados com sucesso.</p>
            </div>
          </div>
          
          {result.errors.length > 0 && (
            <div className={styles.errorsList}>
              <h4>Atenção: Alguns itens não foram importados</h4>
              <ul>
                {result.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
              <p className={styles.errorHint}>Dica: Certifique-se que o código no XML (cProd) corresponde ao SKU cadastrado no sistema.</p>
            </div>
          )}

          <button className={styles.btnReset} onClick={() => setResult(null)}>Fazer nova importação</button>
        </div>
      )}
    </div>
  );
}
