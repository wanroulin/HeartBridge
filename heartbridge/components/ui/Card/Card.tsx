'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function Card ({ children, className = '', onClick, hoverable = false} : CardProps) {
    const classes = [
        styles.card,
        hoverable ? styles.hoverable : '',
        onClick ? styles.clickable : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={ classes} onClick={onClick}>
            {children}
        </div>
    );
}