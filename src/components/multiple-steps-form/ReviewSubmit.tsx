import React from "react";

interface ReviewSubmitProps {
  formData: {
    title: string;
    beschrijving: string;
    email: string;
    phone: string;
  };
  prevStep: () => void;
  submitForm: () => void;
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({ formData, prevStep, submitForm }) => {
  return (
    <div>
      <h2>Review Your Information</h2>
      <p><strong>Name:</strong> {formData.title} {formData.beschrijving}</p>
      <p><strong>Email:</strong> {formData.email}</p>
      <p><strong>Phone:</strong> {formData.phone}</p>
      <button onClick={prevStep}>Back</button>
      <button onClick={submitForm}>Submit</button>
    </div>
  );
};

export default ReviewSubmit;
