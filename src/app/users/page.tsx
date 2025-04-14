"use client";

import { useState } from "react";
import styles from "./user.module.scss";
import { Modal } from '@/components/modal/modal';

export default function Search() {

  const [users, setUsers] = useState([
    {
      id: 1,
    
      companyName: 'JOHN DOE',
      companyEmail: "JOHN@example.com",
      phoneNumber: "1234567890",
      password: "password123",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleDeleteUser = (userIndex) => {
    const updatedUsers = users.filter((_, index) => index !== userIndex);
    setUsers(updatedUsers);
  };

  const handleFormSubmit = (user) => {
    if (user.id) {
      // Edit existing user
      setUsers(users.map((u) => (u.id === user.id ? user : u)));
    } else {
      // Add new user
      setUsers([...users, { ...user, id: Date.now() }]);
    }
    setIsModalOpen(false);
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
              setCurrentUser(null);
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
              <span className={styles.user__userName}>{user.companyName}</span>
              <i
                className={`fa-regular fa-pen-to-square ${styles.user__editIcon}`}
                onClick={() => {
                  setCurrentUser(user);
                  setIsModalOpen(true);
                }}
              ></i>
              <i
                className={`fa-solid fa-trash ${styles.user__deleteIcon}`}
                onClick={() => handleDeleteUser(index)}
              ></i>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      >
        <UserForm
          user={currentUser}
          onSubmit={handleFormSubmit}
        />
      </Modal>
    </div>
  );
}

function UserForm({ user, onSubmit }) {
  const [formData, setFormData] = useState(user || {
    companyName: '',
    companyEmail: '',
    phoneNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit}>

<h3>{user ? `Edit ${formData.companyName || 'User'}` : 'Add New User'}</h3>


      <div>
        <label>companyName:</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className={styles.inputField}
        />
      </div>

      <div>
        <label>companyEmail:</label>
        <input
          type="text"
          name="companyEmail"
          value={formData.companyEmail}
          onChange={handleChange}
          className={styles.inputField}
        />
      </div>

      <div>
        <label>phoneNumber:</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={styles.inputField}
        />
      </div>

      <div>
        <label>password:</label>
        <input
          type="text"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={styles.inputField}
        />
      </div>

      <button className={styles.saveButton} type="submit">Save</button>
    </form>
  );
}