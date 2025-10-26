'use client';

import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'parent' | 'teen' | 'primary' | 'secondary' | 'success' | 'error' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    className?: string;
}

export function Badge ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
} : BadgeProps) {
    const classes = [
        styles.badge,
        styles[variant],
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {children}
        </span>
    );
}