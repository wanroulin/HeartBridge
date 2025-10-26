'use client';

import React, { useEffect } from "react";
import { X } from 'lucide-react';
import styles from './Modal.module.css';
import { Button } from "../Button";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function Modal ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className = {styles.overlay} onClick={ onClose } >
            <div 
            className = {`${styles.modal} ${styles[size]}`}
            onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>{children}</div>

                {/* Footer */}
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    )
}