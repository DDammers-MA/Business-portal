import React from "react";
import styles from './review.module.scss';
import stlye from './form.module.scss'

interface ReviewSubmitProps {
  formData: {
   title: string;
    beschrijving: string;
    opeingsTime: string;
    streetName: string;
    Date: string;
    PostalCode: string;
    place: string;
    StartTime: string;
    Budget: string;
    endTime: string;
    ImagePicker: string;
    email: string;
    phone: string;
  };
  prevStep: () => void;
  submitForm: () => void;
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({ formData, prevStep, submitForm }) => {
  return (
    <div className={stlye.form__textContainer}>
      <h2>Review Your Information</h2>

      <div className={styles.card}>
          <div className={styles.card__imageContainer}>

          <div className={styles.card__details}> 
            <h5 className={styles.card__title}>{formData.title}</h5>
            <p className={styles.card__place}>{formData.place} | { formData.streetName }</p>
          </div>

          </div>
      </div>


   <div className={stlye.form__buttonContainer}>
      <button className={stlye.nextBtn} onClick={prevStep}>Back</button>
      <button className={stlye.nextBtn} onClick={submitForm}>Submit</button>
        </div>
      </div>
  
  );
};

export default ReviewSubmit;
