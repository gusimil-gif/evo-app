"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./AppShell.module.css";

const navItems = [
  { href: "/dashboard", label: "Início", icon: "⊞" },
  { href: "/produtos", label: "Produtos", icon: "▤" },
  { href: "/estoque", label: "Estoque", icon: "◫" },
  { href: "/orcamentos", label: "Orçamentos", icon: "◈" },
  { href: "/clientes", label: "Clientes", icon: "◎" },
  { href: "/parceiros", label: "Parceiros", icon: "◐" },
  { href: "/relatorios", label: "Relatórios", icon: "◑" },
];

const adminNavItems = [
  { href: "/usuarios", label: "Usuários", icon: "◍" },
  { href: "/importar-xml", label: "Importar XML", icon: "◌" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const allItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;
  // Show 5 items on mobile bottom nav
  const mobileItems = navItems.slice(0, 5);

  return (
    <div className={styles.shell}>
      {/* HEADER (Mobile Only) */}
      <header className={styles.mobileHeader}>
        <Image 
          src="/logo-evo.png" 
          alt="EVO" 
          width={80}
          height={24}
          style={{ objectFit: 'contain' }}
          priority
        />
        <button className={styles.mobileLogoutBtn} onClick={logout}>Sair</button>
      </header>

      {/* SIDEBAR (Desktop) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Image 
            src="/logo-evo.png" 
            alt="EVO" 
            className={styles.logoImg} 
            width={140}
            height={40}
            style={{ objectFit: 'contain' }}
            priority
          />
          <div className={styles.logoSub}>Gestão de Estoque</div>
        </div>

        <nav className={styles.sidebarNav}>
          {allItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user?.name?.[0] ?? "U"}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>Sair</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* BOTTOM NAV (Mobile) */}
      <nav className={styles.bottomNav}>
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.bottomNavItem} ${pathname.startsWith(item.href) ? styles.bottomNavItemActive : ""}`}
          >
            <span className={styles.bottomNavIcon}>{item.icon}</span>
            <span className={styles.bottomNavLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
