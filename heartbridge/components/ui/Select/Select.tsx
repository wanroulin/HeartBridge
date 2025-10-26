'use client';

import React, { forwardRef } from 'react';
import styles from './Select.module.css';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps> (
    ({ label, error, helperText, fullWidth = false, options, placeholder, className = '', ...props }, ref) => {
        const selectClasses = [
            styles.select,
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
                <div className={styles.selectWrapper}>
                    <select
                        ref = {ref}
                        className = {selectClasses}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className={styles.icon} size={20} />
                </div>
                {error && <p className = {styles.errorText}>{error}</p>}
                {helperText && !error && <p className = {styles.helperText}>{helperText}</p>}
            </div>
        )
    }
)

Select.displayName = 'Select';