'use client'; 

import React, { useState } from 'react'; 
import styles from './profile.module.scss'; 

const ProfilePage = () => {
    
    const [profile, setProfile] = useState({
        companyName: 'Jouw Bedrijf',
        companyEmail: 'info@jouwbedrijf.nl',
        phoneNumber: '+31 6 12345678',
        password: '********',
    });

    
};

export default ProfilePage;