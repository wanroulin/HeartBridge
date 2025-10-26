'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import styles from './page.module.css';
import { Heart, Mail, Lock, Loader } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    React.useEffect(() => {
        if (user) {
            router.push('/square');
        }
    }, [user, router]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!email || !password) {
                throw new Error('請填入電子郵件和密碼');
            }

            await signInWithEmailAndPassword(auth, email, password);
            router.push('/square');
        } catch (err: any) {
            setError(err.message || '登入失敗，請檢查郵件和密碼');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/auth/register?step=identity');
        } catch (err: any) {
            setError(err.message || 'Google 登入失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logo}>
                    <Heart size={40} />
                    <span>HeartBridge</span>
                </div>

                <h1>登入您的帳號</h1>
                <p>歡迎回到 HeartBridge</p>

                {/* Error Message */}
                {error && (
                    <div className={styles.alert}>
                        <p>{error}</p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleEmailLogin} className={styles.form}>
                    <Input
                        type="email"
                        label="電子郵件"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        required
                    />

                    <Input
                        type="password"
                        label="密碼"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        required
                    />

                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className={styles.spinner} />
                                登入中...
                            </>
                        ) : (
                            '登入'
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                    <span>或</span>
                </div>

                {/* Google Login */}
                <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <img
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3Cpath fill='none' d='M1 1h22v22H1z'/%3E%3C/svg%3E"
                        alt="Google"
                        className={styles.googleIcon}
                    />
                    使用 Google 登入
                </Button>

                {/* Signup Link */}
                <p className={styles.signupLink}>
                    沒有帳號？<Link href="/auth/register">立即註冊</Link>
                </p>

                {/* Footer */}
                <p className={styles.footer}>
                    <Link href="/">回到首頁</Link>
                </p>
            </div>
        </div>
    );
}