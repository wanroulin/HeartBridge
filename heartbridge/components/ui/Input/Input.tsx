'use client';

import React, { forwardRef } from 'react';
import styles from './Input.module.css';
import { label, style } from 'framer-motion/client';
import { string } from 'zod';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps> (
    ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
        const inputClasses = [
            styles.input,
            error ? styles.error : '',
            fullWidth ? styles.fullWidth : '',
            className,
        ].filter(Boolean).join(' ');

        return (
            <div className = {`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
                {label && (
                    <label className = {styles.label}>
                        {label}
                        {props.required && <span className={styles.required}>*</span>}
                    </label>
                )}
                <input
                    ref = {ref}
                    className= {inputClasses}
                    {...props}
                />
                {error && <p className = {styles.errorText}>{error}</p>}
                {helperText && !error && <p className = {styles.helperText}>{helperText}</p>}
            </div>
        )
    }
)

