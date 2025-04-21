'use client';

import React, { useState } from 'react';
import styles from './publisched.module.scss';

const Publised = () => {
    const [activiteiten, setActiviteiten] = useState([
        {
            id: 1,
            image: '/images/image.png',
            title: 'Gepubliceerde Activiteit 1',
            description: 'Dit is een beschrijving van gepubliceerde activiteit 1.',
        },
        {
            id: 2,
            image: '/images/image.png',
            title: 'Gepubliceerde Activiteit 2',
            description: 'Dit is een beschrijving van gepubliceerde activiteit 2.',
        },
        {
            id: 3,
            image: '/images/image.png',
            title: 'Gepubliceerde Activiteit 3',
            description: 'Dit is een beschrijving van gepubliceerde activiteit 3.',
        },
    ]);

};

export default Publised;