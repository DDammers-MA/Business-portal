

import { useEffect } from "react";
import style from "./modal.module.scss";

export const Modal = ({
    isOpen, onClose, children
}:{
    isOpen: boolean,
    onClose: () => void,
    children: React.ReactNode
    }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
    }, [onclick]);
    
    if (!isOpen) return null;


    return (
        <>
            
            <div className={style.model__backdrop}>
                <div className={style.model__content}>

                    <button className={style.model__closeButton} onClick={onClose}><i className="fa-solid fa-x" style={{ color:" #e01010" }}></i></button>
                    {children}
                </div>
            </div>
        </>
    ) 
}