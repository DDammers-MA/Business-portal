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
        <div className={styles.header__container}>

      
        <nav className={styles.header__nav}>
          <ul className={`${styles.header__navList} ${styles["header__navList--first"]}`}>

          <button
            className={`${styles.toggleButton} ${isOpen ? styles["toggleButton--hidden"] : ""}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <i className="fa-solid fa-x"></i> : <i className="fa-solid fa-bars"></i>} {/* Toggle between hamburger and close icon */}
          </button>

          
            <HeaderItem href="/" label="Home" />
            <HeaderItem href="/" label="Activities" />
            <HeaderItem href="/" label="Published" />
            <HeaderItem href="/" label="Unpublished" />
            <HeaderItem href="/" label="Drafs" />
         
          </ul>

          <ul className={styles.header__navList}>
          <li className={styles.header__navItem}>
              <img className={styles.header__logo} src="logo.png" alt="Logo" />
            </li>

          </ul>

          {/* Toggle Button (Hamburger Icon) */}
          {/* Hide this button when sidebar is open */}
   
          </nav>
          </div>
      </header>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles["sidebar--open"] : ""}`}>
        <div className={styles.sidebar__container}>

          <button
            className={styles.toggleButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <i className="fa-solid fa-x"></i> : <i className="fa-solid fa-bars"></i>}
          </button>
        </div>
        <nav className={styles.sidebar__nav}>
          <ul className={styles.sidebar__navList}>
            
        <h2 className={styles.sidebar__title}>
          Admin
          {/* Show the hamburger button only when sidebar is open */}
            </h2>
            
            <SidebarItem href="/" label="Users" />
            <SidebarItem href="/profile" label="Unapproved activities" />
            <SidebarItem href="/settings" label="Statistics" />
          </ul>

          <ul className={`${styles.sidebar__navList} ${styles['sidebar__navList--second']}`}>

            
          <h2 className={styles.sidebar__title}>
          Navigation
          {/* Show the hamburger button only when sidebar is open */}
        </h2>

            <SidebarItem href="/" label="Home" />
            <SidebarItem href="/" label="Activities" />
            <SidebarItem href="/" label="Published" />
            <SidebarItem href="/" label="Unpublished" />
            <SidebarItem href="/" label="Drafs" />
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

const HeaderItem = ({ href, label }: { href: string; label: string }) => {
  return (
    <li className={styles.header__navItem}>
      <Link href={href} className={styles.header__navLink}>
        {label}
      </Link>
    </li>
  );
};

export default Sidebar;
