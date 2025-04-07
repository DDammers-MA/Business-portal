import React from "react";
import styles from "./form.module.scss";
import FormInput from "./FormInput";

interface LocationInfoProps {
  formData: {
    title: string;
    beschrijving: string;
    opeingsTime: string;
    ImagePicker: string;
    Budget: string;
    streetName: string;
    PostalCode: string;
    place: string;
    Date: string;
    StartTime: string
    endTime: string;
    email: string;
    phone: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    beschrijving: string;
    opeingsTime: string;
    ImagePicker: string;
    Budget: string;
    streetName: string;
    PostalCode: string;
    StartTime: string;
    endTime: string;
    Date: string;
    place: string;
    email: string;
    phone: string;
  }>>;
  nextStep: () => void;
  prevStep: () => void;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ formData, setFormData, nextStep, prevStep }) => {
  return (
    <div className={styles.form__textContainer}>
      <h2>Location Information</h2>


      <div className={styles.form__divContainer}>

      <FormInput
      label="street name"
      type="text"
      placeholder="Enter street name"
      value={formData.streetName}
      onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
      className={styles["form__input--title"]}
      />

<FormInput
      label="Date"
      type="Date"
      placeholder="Enter Date"
      value={formData.Date}
      onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
      className={styles["form__input--title"]}
      />

      </div>
      
      <div className={styles.form__divContainer}>

<FormInput
      label="Postal code"
      type="text"
      placeholder="Enter Postal code"
      value={formData.PostalCode}
      onChange={(e) => setFormData({ ...formData, PostalCode: e.target.value })}
      className={styles["form__input--title"]}
      />

<FormInput
      label="Place"
      type="text"
      placeholder="Enter Place"
      value={formData.place}
      onChange={(e) => setFormData({ ...formData, place: e.target.value })}
      className={styles["form__input--title"]}
      />
      </div>


      <div className={styles.form__divContainer}>


<FormInput
      label="Start time"
      type="text"
      placeholder="Enter Start time"
      value={formData.StartTime}
      onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })}
      className={styles["form__input--title"]}
      />

<FormInput
      label="End time"
      type="text"
      placeholder="Enter End time"
      value={formData.endTime}
      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
      className={styles["form__input--title"]}
      />
     
      </div>

      <div className={styles.form__buttonContainer}>

      <button className={styles.nextBtn} onClick={prevStep}>Back</button>
      <button className={styles.nextBtn} onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};

export default LocationInfo;
