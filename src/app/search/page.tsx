"use client";

import styles from "./search.module.scss";

export default function Search() {
  const handleEditUser = (userIndex: number) => {
    console.log(`Edit user ${userIndex + 1}`);
    //Hier komt de back-end voor de functie toeveogen om een gebruiker te bewerken
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search users"
            className={styles.inputField}
          />
        </div>
      </div>
    </div>
  );
}