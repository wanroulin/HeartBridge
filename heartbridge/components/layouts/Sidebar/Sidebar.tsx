'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from '@/components/ui';
import { Heart, Home, BookOpen, Settings, LogOut } from "lucide-react";
import styles from './Sidbar.module.css';
import { formatRoleName } from "../../../lib/utils/format";

export function Sidebar() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Sign out error: ', err);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <aside className={styles.sidebar}>
            {/* logo */}
            <div className={ styles.logo }>
                <Link href='/square'>
                    <Heart size={24} />
                    <span>心橋</span>
                </Link>
            </div>

            {/* UserInfo */}
            <div className={ styles.userInfo }>
                <div className= { styles.userName }>{ user.displayName }</div>
                <Badge variant = { user.role } size = 'sm'>
                    {formatRoleName(user.role)}
                </Badge>
            </div>

            {/* Navigation */}
            <nav className={ styles.nav }>
                <Link href = '/square' className = {`${styles.navLink} ${isActive('/square') ? styles.active : ''}`}>
                    <Home size={20} />
                    <span>廣場</span>
                </Link>


                <Link
                    href="/my-articles"
                    className={`${styles.navLink} ${isActive('/my-articles') ? styles.active : ''}`}
                >
                    <BookOpen size={20} />
                    <span>我的文章</span>
                </Link>

                <Link
                    href="/my-favorites"
                    className={`${styles.navLink} ${isActive('/my-favorites') ? styles.active : ''}`}
                >
                    <Heart size={20} />
                    <span>我的收藏</span>
                </Link>
            </nav>

            {/* Settings */}
            <div className={styles.footer}>
                <Link
                    href="/profile"
                    className={`${styles.footerLink} ${isActive('/profile') ? styles.active : ''}`}
                >
                    <Settings size={20} />
                    <span>設定</span>
                </Link>

                <button
                    onClick={handleSignOut}
                    className={styles.footerLink}
                >
                    <LogOut size={20} />
                    <span>登出</span>
                </button>
            </div>
        </aside>
    )
}