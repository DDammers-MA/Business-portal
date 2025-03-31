"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./sidebar.module.scss";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className={`${styles.header} ${isOpen ? styles["header--shifted"] : ""}`}>
        {/* Header content */}
        <nav className={styles.header__nav}>
          <ul className={`${styles.header__navList} ${styles["header__navList--first"]}`}>

          <button
            className={`${styles.toggleButton} ${isOpen ? styles["toggleButton--hidden"] : ""}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <i className="fa-solid fa-x"></i> : <i className="fa-solid fa-bars"></i>} {/* Toggle between hamburger and close icon */}
          </button>

          
            <li className={styles.header__navItem}>
              <a href="#" className={styles.header__navLink}>Home</a>
            </li>
            <li className={styles.header__navItem}>
              <a href="#" className={styles.header__navLink}>About</a>
            </li>
            <li className={styles.header__navItem}>
              <a href="#" className={styles.header__navLink}>Contact</a>
            </li>
          </ul>

          <ul className={styles.header__navList}>
          <li className={styles.header__navItem}>
              <img className={styles.header__logo} src="logo.png" alt="Logo" />
            </li>
          </ul>

          {/* Toggle Button (Hamburger Icon) */}
          {/* Hide this button when sidebar is open */}
   
        </nav>
      </header>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles["sidebar--open"] : ""}`}>
        <div className={styles.sidebar__container}>

        <h2 className={styles.sidebar__title}>
          Dashboard
          {/* Show the hamburger button only when sidebar is open */}
        </h2>
          <button
            className={styles.toggleButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <i className="fa-solid fa-x"></i> : <i className="fa-solid fa-bars"></i>}
          </button>
        </div>
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
