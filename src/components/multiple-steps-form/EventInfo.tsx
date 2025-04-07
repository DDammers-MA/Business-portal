import React from "react";
import styles from './form.module.scss';
import FormInput from "./FormInput";


interface EventInfoProps {
  formData: {
    title: string;
    beschrijving: string;
    opeingsTime: string;
    ImagePicker: string;
    streetName: string;
    Date: string;
    PostalCode: string;
    place: string;
    StartTime: string;
    Budget: string;
    endTime: string;
    email: string;
    phone: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    beschrijving: string;
    opeingsTime: string;
    ImagePicker: string;
    streetName: string;
    Date: string;
    PostalCode: string;
    place: string;
    StartTime: string;
    endTime: string;
    Budget: string;
    email: string;
    phone: string;
  }>>;
  nextStep: () => void;
}

const EventInfo: React.FC<EventInfoProps> = ({ formData, setFormData, nextStep }) => {
  return (
    <div className={styles.form__textContainer}>
      <h2 className={styles.form__infoTitle}>Event Information</h2>

      <FormInput
      label="Title"
      type="text"
      placeholder="Enter title"
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      className={styles["form__input--title"]}
      />

      <div className={styles.form__div}>
        <label htmlFor="beschrijving" className={styles.form__label}>Description</label>
        <textarea
          className={styles.form__textarea}
          placeholder="Enter description"
          value={formData.beschrijving}
          onChange={(e) => setFormData({ ...formData, beschrijving: e.target.value })}
        />
      </div>


      <FormInput
      label="Budget"
      type="text"
      placeholder="Enter Budget"
      value={formData.Budget}
      onChange={(e) => setFormData({ ...formData, Budget: e.target.value })}
      className={styles["form__input--title"]} 
      />

        <div className={styles.form__divContainer}>
      <FormInput
      label="Openings Time"
      type="time"
      placeholder="Enter Openings Time"
      value={formData.opeingsTime}
      onChange={(e) => setFormData({ ...formData, opeingsTime: e.target.value })}
      className={styles["timepicker"]}
        />        

<FormInput
  label="Image Picker"
          type="file"
          value=""
  placeholder="Enter image"
  className={styles["imgPicker"]}
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, ImagePicker: imageUrl });
    }
  }}
/>

      </div>

      <button className={styles.nextBtn} onClick={nextStep}>Next</button>
    </div>
  );
};

export default EventInfo;


