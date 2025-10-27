'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import { Heart, LogOut, Settings, Menu, X } from "lucide-react";
import { getInitials, getAvatarColor } from '@/lib/utils/format';
import styles from './Header.module.css';
import { style } from "framer-motion/client";

export function Header() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [ showMenu, setShowMenu ] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (err) {
            console.error('Sign out error: ', err);
        }
    };

    if (!user) {
        return null;
    }

    const initials = getInitials(user.displayName);
    const avatarColor = getAvatarColor(user.displayName);

    return (
        <header className = {styles.header}>
            <Link href = '/square' className= {styles.logo}>
                <Heart size={28} />
                <span>HeartBridge</span>
            </Link>

            <nav className= {styles.nav}>
                <Link href='/square'>心橋廣場</Link>
                <Link href='/my-articles'>我的文章</Link>
                <Link href='/my-favorites'>我的收藏</Link>
            </nav>

            <div className={styles.actions}>
                <div className={styles.userMenu} onClick={() => setShowMenu(!showMenu)}>
                    <div
                    className={styles.avatar}
                    style={{ backgroundColor: avatarColor}}>
                        {initials}
                    </div>
                    <span className={styles.userName}>{ user.displayName }</span>
                </div>

                {showMenu && (
                    <div style={{
                        position: 'absolute',
                        top: '60px',
                        right: '20px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        minWidth: '200px',
                    }}>
                        <Link href='/profile' style={{ display: 'block', padding: '0.75rem 1rem', color: 'var(--text-primary)', textDecoration: 'none'}}>
                            <Settings size={16} style={{ marginRight: '0.5rem' }} />
                                個人資料
                        </Link>
                        <button onClick={handleSignOut} style = {{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center',}}>
                            <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                            登出
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}