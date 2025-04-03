import React from "react";

interface ContactInfoProps {
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
    opeingsTime: string;
    email: string;
    phone: string;
  }>>;
  nextStep: () => void;
  prevStep: () => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ formData, setFormData, nextStep, prevStep }) => {
  return (
    <div>
      <h2>Contact Information</h2>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <button onClick={prevStep}>Back</button>
      <button onClick={nextStep}>Next</button>
    </div>
  );
};

export default ContactInfo;
