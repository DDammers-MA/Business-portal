"use client"; 

import styles from "./search.module.scss";

export default function Search() {
  const handleEditUser = (userIndex: number) => {
    console.log(`Edit user ${userIndex + 1}`);
    //Hier komt de back-end voor de functie toeveogen om een gebruiker te bewerken
  };


  return (
    <div className={styles.search}>
      <h1>Search</h1>
      <p>Search page content goes here.</p>
    </div>
  );
}