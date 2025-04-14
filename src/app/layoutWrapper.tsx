// LayoutWrapper.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import styles from "./layout.module.scss";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`${styles.main} ${isOpen ? styles.mainShifted : ""}`}
      >
        {children}
      </main>
    </>
  );
};

export default LayoutWrapper;
