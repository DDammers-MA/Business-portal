"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./user.module.scss";

export default function Search() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null); 
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    phoneNumber: "",
    password: "",
  }); 

  const handleEditUser = (userIndex: number) => {
    setSelectedUser(userIndex); 
    setIsModalOpen(true); 
  };

  const handleDeleteUser = (userIndex: number) => {
    console.log(`Delete user ${userIndex + 1}`);
    // Hier komt de back-end voor de functie om een gebruiker te verwijderen
  };

  const handleAddUser = () => {
    router.push("/register");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null); 
    setFormData({
      companyName: "",
      companyEmail: "",
      phoneNumber: "",
      password: "",
    }); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      {}
      <div className={`${styles.modalOverlay} ${isModalOpen ? styles.show : ""}`}>
        <div className={styles.modal}>
          <h2>Edit User</h2>
          <form className={styles.modalForm}>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleInputChange} 
              className={styles.inputField}
            />
            <input
              type="email"
              name="companyEmail"
              placeholder="Company Email"
              value={formData.companyEmail}
              onChange={handleInputChange}
              className={styles.inputField}
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={styles.inputField}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.inputField}
            />
          </form>
          <button onClick={closeModal} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}