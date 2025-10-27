import React from 'react';
import { Sidebar } from '@/components/layouts/Sidebar';
import styles from './layout.module.css';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}