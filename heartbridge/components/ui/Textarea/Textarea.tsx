'use client';

import React, { forwardRef } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps> (
    ({ label, error, helperText, fullWidth = false, rows = 4, className = '', ...props }, ref) => {
        const textareaClasses = [
            styles.textarea,
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
                <textarea
                    ref = {ref}
                    className = {textareaClasses}
                    rows = {rows}
                    {...props}
                />
                {error && <p className = {styles.errorText}>{error}</p>}
                {helperText && !error && <p className = {styles.helperText}>{helperText}</p>}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea';