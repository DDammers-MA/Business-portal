"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./user.module.scss";

import { Modal } from '@/components/modal/modal';

export default function Search() {

  const users = [
    {
      id: 1,
      image: '/images/image.png',
      Name: 'JOHN DOE',
     
    },
  ];
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

  const handleSaveChanges = () => {
    console.log("Wijzigingen opgeslagen:", formData);
    // Hier komt de back-end logica om de wijzigingen op te slaan
    closeModal(); 
  };

  return (
    <div className={styles.user}>
      <div className={styles.user__container}>
        
      <div className={styles.user__header}>
        <div className={styles.user__searchBar}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search users"
            className={styles.user__inputField}
          />
        </div>
        <button
          className={styles.user__addUserButton}
        	onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Add new user
        </button>
        </div>
        


        <div className={styles.user__userList}>
  {users.map((user, index) => (
    <div key={user.id} className={styles.user__userRow}>
       <i className={'fa-regular fa-circle-user ${styles.user__userIcon'}></i>
      <span className={styles.user__userName}>{user.Name}</span>
      <i
        className={`fa-regular fa-pen-to-square ${styles.user__editIcon}`}
        onClick={() => handleEditUser(index)}
      ></i>
      <i
        className={`fa-solid fa-trash ${styles.user__deleteIcon}`}
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
          <div className={styles.modalButtons}>
            <button onClick={closeModal} className={styles.closeButton}>
              Close
            </button>
            <button onClick={handleSaveChanges} className={styles.saveButton}>
              Wijzig
            </button>
          </div>
        </div>
      </div>
      </div>

      <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
              }}
            >
              <p>hallo</p>
            </Modal>


      </div>
  );
}