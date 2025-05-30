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

interface ActiviteitCardProps {
    image: string;
    title: string;
    description: string;
    onDelete: () => void;
}

const ActiviteitCard: React.FC<ActiviteitCardProps> = ({
    image,
    title,
    description,
    onDelete,
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
                    <i
                        className="fa-solid fa-trash"
                        style={{ color: '#f00f0f', cursor: 'pointer' }}
                        onClick={onDelete}
                    ></i>
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

export default Publised;