"use client";

import { useRouter } from "next/navigation"; 
import styles from "./user.module.scss";

export default function Search() {
  const router = useRouter(); 

  const handleEditUser = (userIndex: number) => {
    console.log(`Edit user ${userIndex + 1}`);
    // Hier komt de back-end voor de functie om een gebruiker te bewerken
  };

  const handleDeleteUser = (userIndex: number) => {
    console.log(`Delete user ${userIndex + 1}`);
    // Hier komt de back-end voor de functie om een gebruiker te verwijderen
  };

  const handleAddUser = () => {
    router.push("/register"); 
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
        <button
          className={styles.addUserButton}
          onClick={handleAddUser} 
        >
          Add new user
        </button>
      </div>
      <div className={styles.userList}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.userRow}>
            <i className={`fa-regular fa-circle-user ${styles.userIcon}`}></i>
            <span className={styles.userName}>John Doe</span>
            <i
              className={`fa-regular fa-pen-to-square ${styles.editIcon}`}
              onClick={() => handleEditUser(index)}
            ></i>
            <i
              className={`fa-solid fa-trash ${styles.deleteIcon}`}
              onClick={() => handleDeleteUser(index)}
            ></i>
          </div>
        ))}
      </div>
    </div>
  );
}