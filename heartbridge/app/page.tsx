'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Heart, MessageCircle, Shield, Users } from 'lucide-react';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && user) {
            router.push('/square');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Heart size={32} />
                    <span>HeartBridge</span>
                </div>
                <nav className={styles.nav}>
                    <Link href="#about">關於我們</Link>
                    <Link href="#features">功能特色</Link>
                </nav>
                <div className={styles.headerActions}>
                    <Link href="/auth/login">
                        <Button variant="outline" size="md">
                            登入
                        </Button>
                    </Link>
                    <Link href="/auth/register">
                        <Button size="md">
                            開始使用
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>親子溝通的橋梁</h1>
                    <p>
                        HeartBridge 是一個安全的匿名交流平台，
                        幫助家長和青少年理解彼此，建立更良好的親子關係。
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/auth/register">
                            <Button size="lg">開始免費體驗</Button>
                        </Link>
                        <Link href="#features">
                            <Button variant="outline" size="lg">
                                了解更多
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className={styles.heroImage}>
                    <div className={styles.illustration}>
                        <Heart size={120} strokeWidth={1} />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <h2>為什麼選擇 HeartBridge？</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Shield size={40} />
                        </div>
                        <h3>完全匿名</h3>
                        <p>保護隱私，鼓勵真實表達。所有用戶互動完全匿名。</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <MessageCircle size={40} />
                        </div>
                        <h3>安全交流</h3>
                        <p>內容審查機制確保平台安全，AI 助手幫助改善溝通。</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Users size={40} />
                        </div>
                        <h3>社群支持</h3>
                        <p>與其他家長和青少年連結，分享經驗和建議。</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Heart size={40} />
                        </div>
                        <h3>智能統整</h3>
                        <p>AI 幫您整理留言觀點，找出共識與分歧點。</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className={styles.about}>
                <h2>我們的使命</h2>
                <p>
                    在親子關係中，溝通是關鍵。但常常因為害怕、誤解或不知道如何表達，
                    導致彼此的距離越來越遠。HeartBridge 致力於成為那座連結的橋梁，
                    讓家長和青少年能夠安全、坦誠地交流，進而建立更深層的理解和信任。
                </p>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <h2>準備好連結親子關係了嗎？</h2>
                <Link href="/auth/register">
                    <Button size="lg">加入 HeartBridge</Button>
                </Link>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>&copy; 2025 HeartBridge. 促進親子溝通的橋梁。</p>
            </footer>
        </div>
    );
}