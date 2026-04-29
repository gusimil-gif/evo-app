"use client";

// import Image removed as standard img tag is used
import styles from "./catalogo.module.css";

export default function CatalogoB2BPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.catalogPage}>
      <div className={styles.printActions}>
        <p style={{ marginBottom: "1rem" }}>Essa página foi formatada perfeitamente para exportação A4.</p>
        <button onClick={handlePrint} className={styles.printBtn}>
          Salvar como PDF
        </button>
      </div>

      {/* Página 1 - Capa */}
      <div className={`${styles.a4Page} ${styles.coverPage}`}>
        <img src="/logo-evo-white.png" alt="EVO Logo" width={200} height={200} className={styles.coverLogo} />
        <h1 className={styles.coverTitle}>EVO CORPORATE</h1>
        <p className={styles.coverSubtitle}>Elegância em Movimento para a sua marca.</p>
        <div className={styles.coverImageWrapper}>
          <img src="/mochila-b2b.png" alt="Mochila EVO" className={styles.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Página 2 - Quem Somos & Co-branding */}
      <div className={`${styles.a4Page} ${styles.aboutPage}`}>
        <div className={styles.sectionTag}>O Mercado Corporativo</div>
        <h2 className={styles.aboutTitle}>ELEVANDO O PADRÃO<br/>DO SEU BRINDE CORPORATIVO</h2>
        <p className={styles.aboutText}>
          A EVO nasceu para unir design sofisticado, funcionalidade extrema e alta durabilidade. Especialistas em mochilas, malas e acessórios em couro 100% legítimo, criamos peças que acompanham rotinas exigentes com elegância.
        </p>
        <p className={styles.aboutText}>
          Sabemos que o item que carrega a sua marca diz muito sobre a sua empresa. Nossos produtos não são apenas presentes, são uma declaração de valor e prestígio para seus clientes mais exclusivos e diretores.
        </p>
        
        <ul className={styles.featureList}>
          <li>Couro nobre de exportação (floater)</li>
          <li>Design autoral e atemporal</li>
          <li>Certificação LWG – garantia de origem sustentável</li>
        </ul>

        <div style={{ marginTop: "4rem", padding: "2rem", background: "#f5f5f5", borderRadius: "12px" }}>
          <h3 className={styles.diffTitle}>SUA MARCA COM ASSINATURA DE EXCELÊNCIA</h3>
          <p className={styles.aboutText} style={{ marginBottom: 0 }}>
            Oferecemos a possibilidade de personalizar nossos produtos com a <strong>sua logomarca</strong> (Co-branding). Gravação sofisticada em baixo relevo ou clichê térmico diretamente no couro. Transforme nossos artigos premium em um item assinado pela sua marca (Ex: Vero Via by EVO).
          </p>
        </div>
      </div>

      {/* Página 3 - Mochilas */}
      <div className={`${styles.a4Page} ${styles.productPage}`}>
        <div className={styles.productHeader}>
          <div className={styles.sectionTag}>Coleção Executiva</div>
          <h2 className={styles.productTitle}>MOCHILA EVO VICENZA</h2>
        </div>
        
        <div className={styles.productContent}>
          <div>
            <p className={styles.productDesc}>
              A escolha perfeita para o executivo dinâmico. Une praticidade e estilo para o dia a dia, com espaço ideal para organizar pertences com conforto e segurança em qualquer ambiente corporativo.
            </p>
            
            <div className={styles.diffTitle}>Diferenciais Exclusivos:</div>
            <ul className={styles.featureList} style={{ marginTop: "1rem" }}>
              <li>Compartimento acolchoado para notebook 15,6”</li>
              <li>Bolso traseiro antifurto com zíper oculto</li>
              <li>Elástico traseiro para encaixe perfeito em malas</li>
              <li>Alças anatômicas ajustáveis</li>
              <li>Forro em sarja 100% algodão</li>
            </ul>

            <div className={styles.colorOptions}>
              <div className={styles.diffTitle}>Cores Disponíveis</div>
              <p className={styles.colorOptionText}>Preto • Café • Pinhão</p>
            </div>
          </div>
          
          <div className={styles.productImageWrapper}>
            <img src="/mochila-b2b.png" alt="Mochila EVO Vicenza" className={styles.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Página 4 - Malas */}
      <div className={`${styles.a4Page} ${styles.productPage}`}>
        <div className={styles.productHeader}>
          <div className={styles.sectionTag}>Coleção Viagem</div>
          <h2 className={styles.productTitle}>DUFFLE BAG EVO</h2>
        </div>
        
        <div className={styles.productContent}>
          <div className={styles.productImageWrapper}>
            <img src="/mala-b2b.png" alt="Duffle Bag EVO" className={styles.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ paddingLeft: "1rem" }}>
            <p className={styles.productDesc}>
              A companheira ideal para viagens curtas de negócios, idas ao clube ou academia. Um presente corporativo de altíssimo impacto visual e valor percebido para seus maiores parceiros.
            </p>
            
            <div className={styles.diffTitle}>Diferenciais Exclusivos:</div>
            <ul className={styles.featureList} style={{ marginTop: "1rem" }}>
              <li>Couro premium floater super resistente</li>
              <li>Amplo espaço interno para organização</li>
              <li>Alça transversal em couro, removível e ajustável</li>
              <li>Base com reforço para maior durabilidade</li>
              <li>Acabamentos e metais de altíssimo padrão</li>
            </ul>

            <div className={styles.colorOptions}>
              <div className={styles.diffTitle}>Cores Disponíveis</div>
              <p className={styles.colorOptionText}>Preto • Café</p>
            </div>
          </div>
        </div>
      </div>

      {/* Página 5 - Acessórios e Kits */}
      <div className={`${styles.a4Page} ${styles.productPage}`}>
        <div className={styles.productHeader}>
          <div className={styles.sectionTag}>Office & Onboarding</div>
          <h2 className={styles.productTitle}>ACESSÓRIOS & KITS</h2>
        </div>
        
        <div className={styles.productContent}>
          <div>
            <p className={styles.productDesc}>
              Pequenos detalhes que transformam o ambiente de trabalho. Nossos acessórios são perfeitos para compor "Kits de Onboarding" de executivos ou presentes memoráveis de final de ano.
            </p>
            
            <div className={styles.diffTitle}>Linha Completa:</div>
            <ul className={styles.featureList} style={{ marginTop: "1rem" }}>
              <li><strong>Necessarie EVO:</strong> Sofisticação e organização.</li>
              <li><strong>Organizador de Mesa Dock:</strong> Elegância no escritório.</li>
              <li><strong>Organizador Tech Dock:</strong> Para cabos e carregadores.</li>
              <li><strong>Deskpad DOCK:</strong> Conforto e proteção para a mesa.</li>
              <li><strong>Porta Cartão Clip EVO:</strong> Minimalismo essencial.</li>
            </ul>

            <div className={styles.colorOptions}>
              <div className={styles.diffTitle}>Sugestão de Kit Corporativo</div>
              <p className={styles.colorOptionText}>Deskpad + Organizador de Mesa + Porta Cartão</p>
            </div>
          </div>
          
          <div className={styles.productImageWrapper}>
            <img src="/kit-b2b.png" alt="Kit de Acessórios EVO" className={styles.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Página 6 - Contato */}
      <div className={`${styles.a4Page} ${styles.contactPage}`}>
        <div className={styles.sectionTag} style={{ color: "#888" }}>Vamos conversar?</div>
        <h2 className={styles.contactTitle}>CONSTRUA ESSA EXPERIÊNCIA<br/>COM A EVO</h2>
        <p className={styles.contactDesc}>
          Nosso time está pronto para entender a demanda da sua empresa, sugerir as melhores composições de produtos e realizar um orçamento sob medida para o seu projeto B2B.
        </p>

        <div className={styles.contactBox}>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>WhatsApp</span>
            <span className={styles.contactValue}>+55 19 98122-6232</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>E-mail</span>
            <span className={styles.contactValue}>contato@useevo.store</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Site</span>
            <span className={styles.contactValue}>www.useevo.store</span>
          </div>
          <div className={styles.contactItem} style={{ marginBottom: 0, marginTop: "3rem" }}>
            <span className={styles.contactLabel}>Matriz</span>
            <span className={styles.contactValue}>Rua Helena Argentin Canova, 61<br/>João Aranha | Paulínia-SP</span>
          </div>
        </div>
        
        <div style={{ marginTop: "4rem", textAlign: "center", color: "#666" }}>
          EVO ELEGÂNCIA EM MOVIMENTO LTDA.
        </div>
      </div>

    </div>
  );
}
