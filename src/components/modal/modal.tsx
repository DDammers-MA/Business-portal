

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

                    <button onClick={onClose}>Close</button>
                    {children}
                </div>
            </div>
        </>
    ) 
}