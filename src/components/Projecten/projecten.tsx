"use client"; 

import React, { useState } from "react";
import styles from "./projecten.module.scss";

const Projecten = () => {
  const projects = [
    {
      id: 1,
      image: "/images/image.png",
      title: "Project 1",
      description: "Dit is een beschrijving van project 1.",
    },
    {
      id: 2,
      image: "/images/image.png",
      title: "Project 2",
      description: "Dit is een beschrijving van project 2.",
    },
    {
      id: 3,
      image: "/images/image.png",
      title: "Project 3",
      description: "Dit is een beschrijving van project 3.",
    },
    {
      id: 4,
      image: "/images/image.png",
      title: "Project 4",
      description: "Dit is een beschrijving van project 4.",
    },
    {
      id: 5,
      image: "/images/image.png",
      title: "Project 5",
      description: "Dit is een beschrijving van project 5.",
    },
    {
      id: 6,
      image: "/images/image.png",
      title: "Project 6",
      description: "Dit is een beschrijving van project 6.",
    },
  ];

  return (
    <div className={styles.projecten}>
      <div className={styles.projecten__list}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            image={project.image}
            title={project.title}
            description={project.description}
          />
        ))}
      </div>
    </div>
  );
};

interface ProjectCardProps {
  image: string;
  title: string;
  description: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ image, title, description }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };

  return (
    <div className={styles.project}>
      <img src={image} alt={title} className={styles.project__image} />
      <h2 className={styles.project__title}>{title}</h2>
      <p className={styles.project__description}>{description}</p>

      <div className={styles.project__footer}>
      <div className={styles.project__actions}>
      <i className="fa-solid fa-trash" style={{ color: "#f00f0f" }}></i>
      <i className="fa-regular fa-pen-to-square"></i>
      </div>
      {/* Toggle switch */}
      <div
        className={`${styles.toggle} ${isToggled ? styles.toggle__on : ""}`}
        onClick={handleToggle}
      >
        <div className={styles.toggle__circle}></div>
      </div>
      </div>

    
    </div>
  );
};

export default Projecten;