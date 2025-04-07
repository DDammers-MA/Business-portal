"use client";

import { useState } from "react";
import PersonalInfo from "./PersonalInfo ";
import ContactInfo from "./ContactInfo";
import ReviewSubmit from "./ReviewSubmit";
import styles from "./form.module.scss"

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    beschrijving: "",
    opeingsTime: "",
    email: "",
    phone: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const submitForm = () => {
    console.log("Form Submitted:", formData);
    alert("Form Submitted Successfully!");
  };

  return (
    <form className={styles.form} >
      {step === 1 && <PersonalInfo formData={formData} setFormData={setFormData} nextStep={nextStep} />}
      {step === 2 && <ContactInfo formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <ReviewSubmit formData={formData} prevStep={prevStep} submitForm={submitForm} />}
    </form>
  );
};

export default MultiStepForm;
