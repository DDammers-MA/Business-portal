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

    const handleDelete = (id: number) => {
        setActiviteiten((prevActiviteiten) =>
            prevActiviteiten.filter((activiteit) => activiteit.id !== id)
        );
    };

    return (
        <div className={styles.event}> 
            <div className={styles.event__container}> 
                <div className={styles.event__list}> 
                    
                    {activiteiten.map((activiteit) => (
                        <ActiviteitCard
                            key={activiteit.id} 
                            image={activiteit.image} 
                            title={activiteit.title} 
                            description={activiteit.description} 
                            onDelete={() => handleDelete(activiteit.id)} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Publised;