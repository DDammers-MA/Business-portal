import React from "react";
import styles from './review.module.scss';
import style from './form.module.scss'

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
  step: number;
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({ formData, prevStep, submitForm, step }) => {
  return (
    <div className={styles.preview}>
      <h2 className={styles.preview__title}>Preview of Card</h2>
      <div className={styles.preview__Container}>
        <div className={styles.card}>
          <div className={styles.card__imageContainer}>
            <div className={styles.card__details}>
              <h5 className={styles.card__title}>{formData.title}</h5>
              <p className={styles.card__place}>
                {formData.place} | {formData.streetName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {step === 3 && ( 
        <div className={style.form__buttonContainer}>
          <button className={style.nextBtn} onClick={prevStep}>
            Back
          </button>
          <button className={style.nextBtn} onClick={submitForm}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSubmit;
