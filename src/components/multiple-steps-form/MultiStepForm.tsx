"use client";

import { useState } from "react";
import EventInfo from "./EventInfo";
import LocationInfo from "./LocationInfo";
import ReviewSubmit from "./ReviewSubmit";
import styles from "./form.module.scss"

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    beschrijving: "",
    opeingsTime: "",
    ImagePicker: "",
    Budget: "",
    streetName: "",
    PostalCode: "",
    Date: "",
    place: '',
    StartTime: "",
    endTime: "",
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
      {step === 1 && <EventInfo formData={formData} setFormData={setFormData} nextStep={nextStep} />}
      {step === 2 && <LocationInfo formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <ReviewSubmit formData={formData} prevStep={prevStep} submitForm={submitForm} />}
    </form>
  );
};


export default MultiStepForm;
