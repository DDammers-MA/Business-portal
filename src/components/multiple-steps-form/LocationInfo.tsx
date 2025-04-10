import React from "react";
import styles from "./form.module.scss";
import FormInput from "./FormInput";
import ReviewSubmit from "./ReviewSubmit";

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

    <div className={styles.form__Container} >

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

      <div className={styles.form__previewContainer}>

<ReviewSubmit formData={{
   title: formData.title,
   beschrijving: formData.beschrijving,
   opeingsTime: formData.opeingsTime,
   streetName:  formData.streetName,
   Date:  formData.Date,
   PostalCode:  formData.PostalCode,
   place:  formData.place,
   StartTime:  formData.StartTime,
   Budget:  formData.Budget,
   endTime:  formData.endTime,
   ImagePicker: formData.ImagePicker,
   email:  formData.email,
   phone: formData.phone,
        }} prevStep={function (): void {
          throw new Error("Function not implemented.");
        } } submitForm={function (): void {
          throw new Error("Function not implemented.");
        } } step={0}/>
</div>

      </div>
  );
};

export default LocationInfo;
