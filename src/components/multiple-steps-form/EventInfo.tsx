import React from "react";
import styles from './form.module.scss';
import FormInput from "./FormInput";
import ReviewSubmit from "./ReviewSubmit";



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
    <div className={styles.form__Container}>

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



        <div className={styles.form__divContainer}>
      {/* <FormInput
      label="Openings Time"
      type="time"
      placeholder="Enter Openings Time"
      value={formData.opeingsTime}
      onChange={(e) => setFormData({ ...formData, opeingsTime: e.target.value })}
      className={styles["timepicker"]}
        />         */}
          
          
      <FormInput
      label="Budget"
      type="text"
      placeholder="Enter Budget"
      value={formData.Budget}
      onChange={(e) => setFormData({ ...formData, Budget: e.target.value })}
      className={styles["form__input--title"]} 
      />

<div className={styles.fileUpload}>
<label htmlFor="">Image </label>
  <label htmlFor="imagePicker" className={styles.fileUpload__button}>
    Upload Image
  </label>
  <input
    id="imagePicker"
    type="file"
    className={styles.fileUpload__input}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setFormData({ ...formData, ImagePicker: imageUrl });
      }
    }}
  />
</div>
        </div>
        <button className={styles.nextBtn} onClick={nextStep}>Next</button>
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

export default EventInfo;


