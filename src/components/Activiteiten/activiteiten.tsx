'use client';

import React, { useState } from 'react';
import styles from './activiteiten.module.scss';

const Activiteiten = () => {
    const activiteiten = [
        {
            id: 1,
            image: '/images/image.png',
            title: 'Activiteit 1',
            description: 'Dit is een beschrijving van activiteit 1.',
        },
        {
            id: 2,
            image: '/images/image.png',
            title: 'Activiteit 2',
            description: 'Dit is een beschrijving van activiteit 2.',
        },
        {
            id: 3,
            image: '/images/image.png',
            title: 'Activiteit 3',
            description: 'Dit is een beschrijving van activiteit 3.',
        },
        {
            id: 4,
            image: '/images/image.png',
            title: 'Activiteit 4',
            description: 'Dit is een beschrijving van activiteit 4.',
        },
        {
            id: 5,
            image: '/images/image.png',
            title: 'Activiteit 5',
            description: 'Dit is een beschrijving van activiteit 5.',
        },
        {
            id: 6,
            image: '/images/image.png',
            title: 'Activiteit 6',
            description: 'Dit is een beschrijving van activiteit 6.',
        },
    ];

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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

interface ActiviteitCardProps {
    image: string;
    title: string;
    description: string;
}

const ActiviteitCard: React.FC<ActiviteitCardProps> = ({
    image,
    title,
    description,
}) => {
    const [isToggled, setIsToggled] = useState(false);

    const handleToggle = () => {
        setIsToggled((prev) => !prev);
    };

    return (
        <div
            className={`${styles.project} ${
                isToggled ? styles.project__toggled : ''
            }`}
        >
            <img src={image} alt={title} className={styles.project__image} />
            <h2 className={styles.project__title}>{title}</h2>
            <p className={styles.project__description}>{description}</p>

            <div className={styles.project__footer}>
                <div className={styles.project__actions}>
                    <i className="fa-solid fa-trash" style={{ color: '#f00f0f' }}></i>
                    <i className="fa-regular fa-pen-to-square"></i>
                </div>
                <div
                    className={`${styles.toggle} ${isToggled ? styles.toggle__on : ''}`}
                    onClick={handleToggle}
                >
                    <div className={styles.toggle__circle}></div>
                </div>
            </div>
        </div>
    );
};

export default Activiteiten;