'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';
import { Heart, Users, User } from 'lucide-react';

export default function IdentityPage() {
    const [selectedRole, setSelectedRole] = useState<'parent' | 'teen' | null>(null);
    const router = useRouter();
    const { user } = useAuth();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        if (user) {
            router.push('/square');
        }
    }, [user, router]);

    const handleContinue = () => {
        if (selectedRole) {
            // 將角色保存到 localStorage（臨時方案，之後改成 Context）
            localStorage.setItem('registrationRole', selectedRole);
            router.push('/auth/register/profile');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>
                        <Heart size={32} />
                        <span>HeartBridge</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className={styles.card}>
                    <h1>您是誰？</h1>
                    <p>選擇您的身份，開始 HeartBridge 之旅</p>

                    {/* Role Selection */}
                    <div className={styles.roleGrid}>
                        {/* Parent Role */}
                        <Card
                            hoverable
                            onClick={() => setSelectedRole('parent')}
                            className={`${styles.roleCard} ${selectedRole === 'parent' ? styles.selected : ''}`}
                        >
                            <div className={styles.roleIcon}>
                                <Users size={48} />
                            </div>
                            <h3>家長</h3>
                            <p>我想理解孩子，建立更好的溝通</p>
                            <div className={styles.benefits}>
                                <span>✓ 瞭解青少年想法</span>
                                <span>✓ 分享教養經驗</span>
                                <span>✓ 建立信任橋樑</span>
                            </div>
                        </Card>

                        {/* Teen Role */}
                        <Card
                            hoverable
                            onClick={() => setSelectedRole('teen')}
                            className={`${styles.roleCard} ${selectedRole === 'teen' ? styles.selected : ''}`}
                        >
                            <div className={styles.roleIcon}>
                                <User size={48} />
                            </div>
                            <h3>青少年</h3>
                            <p>我想被家長理解，安全地表達自己</p>
                            <div className={styles.benefits}>
                                <span>✓ 安全匿名交流</span>
                                <span>✓ 分享真實想法</span>
                                <span>✓ 被聽見和理解</span>
                            </div>
                        </Card>
                    </div>

                    {/* Info Box */}
                    <div className={styles.infoBox}>
                        <p>
                            <strong>提示：</strong>您的身份選擇幫助我們為您提供個性化的內容和主題。
                            您可以在之後的設定中更改這個選擇。
                        </p>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <Button
                            size="lg"
                            fullWidth
                            onClick={handleContinue}
                            disabled={!selectedRole}
                        >
                            繼續
                        </Button>
                        <p className={styles.backLink}>
                            <Link href="/auth/login">回到登入</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}