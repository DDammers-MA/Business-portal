"use client";

import { useState,  } from "react";
import Link from "next/link";
import styles from "./sidebar.module.scss";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.header__nav}>
          <ul className={styles.header__navList}>
            <li className={styles.header__navItem}>
              <a href="" className={styles.header__navLink}>Home</a>
            </li>
            <li className={styles.header__navItem}>
              <a href="" className={styles.header__navLink}>About</a>
            </li>
            <li className={styles.header__navItem}>
              <a href="" className={styles.header__navLink}>Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Toggle Button - Moves inside when open */}
      <button
        className={`${styles.toggleButton} ${isOpen ? styles["toggleButton--inside"] : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "×" : "☰"}
      </button>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles["sidebar--open"] : ""}`}>
        <h2 className={styles.sidebar__title}>Dashboard</h2>
        <nav>
          <ul className={styles.sidebar__navList}>
            <SidebarItem href="/" label="Home" />
            <SidebarItem href="/profile" label="Profile" />
            <SidebarItem href="/settings" label="Settings" />
          </ul>
        </nav>
      </div>
    </>
  );
};

const SidebarItem = ({ href, label }: { href: string; label: string }) => {
  return (
    <li className={styles.sidebar__navItem}>
      <Link href={href} className={styles.sidebar__navLink}>
        {label}
      </Link>
    </li>
  );
};

export default Sidebar;
