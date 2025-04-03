import React from "react";
import styles from './form.module.scss';


interface PersonalInfoProps {
  formData: {
    title: string;
    beschrijving: string;
    opeingsTime: string;
    email: string;
    phone: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    beschrijving: string;
    opeingsTime: string
    email: string;
    phone: string;
  }>>;
  nextStep: () => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ formData, setFormData, nextStep }) => {
  return (
    <div className={styles.form__textContainer}>
      <h2 className={styles.form__infoTitle}>Event Information</h2>

      <div className={styles.form__div}>
        <label htmlFor="title" className={styles.form__label}>Title</label>
        <input
          className={`${styles.form__input} ${styles["form__input--title"]}`}
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className={styles.form__div}>
        <label htmlFor="beschrijving" className={styles.form__label}>Beschrijving</label>
        <textarea
          className={styles.form__textarea}
          placeholder="Beschrijving"
          value={formData.beschrijving}
          onChange={(e) => setFormData({ ...formData, beschrijving: e.target.value })}
        />
      </div>

      <div className={styles.form__divContainer}>
        <div className={styles.form__div}>
          <label htmlFor="timepicker" className={styles.form__label}>Openings Time</label>
          <input
            className={`${styles.form__input} ${styles["timepicker"]}`}
            type="time"
            id="timepicker"
            placeholder="Openings time"
            value={formData.opeingsTime}
            onChange={(e) => setFormData({ ...formData, opeingsTime: e.target.value })}
          />
        </div>

        <div className={styles.form__div}>
          <label htmlFor="imgPicker" className={styles.form__label}>Image Picker</label>
          <input
            className={`${styles.form__input} ${styles["imgPicker"]}`}
            type="file"
            placeholder="Openings time"
            value={formData.opeingsTime}
            onChange={(e) => setFormData({ ...formData, opeingsTime: e.target.value })}
          />
        </div>
      </div>

      <button className={styles.nextBtn} onClick={nextStep}>Next</button>
    </div>
  );
};

export default PersonalInfo;


