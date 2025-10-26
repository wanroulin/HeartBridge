'use client';

import { size } from 'zod';
import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function Button ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
} : ButtonProps) {
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            className = {classes}
            disabled = { disabled }
            {...props}
        >
            {children}
        </button>
    );
}