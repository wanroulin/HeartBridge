'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Select, SelectOption } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { User, UserRole } from '@/lib/types';
import styles from './page.module.css';
import { Heart, Loader } from 'lucide-react';

export default function ProfilePage() {
    const { firebaseUser, loading: authLoading } = useAuth();
    const [role, setRole] = useState<UserRole>('teen');
    const [displayName, setDisplayName] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [interests, setInterests] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    React.useEffect(() => {
        // 從 localStorage 取得已選擇的角色
        const savedRole = localStorage.getItem('registrationRole') as UserRole;
        if (savedRole) {
            setRole(savedRole);
        }
    }, []);

    React.useEffect(() => {
        if (!authLoading && !firebaseUser) {
            router.push('/auth/login');
        }
    }, [firebaseUser, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!displayName || !ageRange || !birthYear || !birthMonth || !birthDay) {
                throw new Error('請填入所有必填欄位');
            }

            if (!firebaseUser) {
                throw new Error('用戶未授權');
            }

            const interestList = interests
                .split(',')
                .map((i) => i.trim())
                .filter((i) => i);

            const userData: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName,
                role,
                birthDate: {
                    year: parseInt(birthYear),
                    month: parseInt(birthMonth),
                    day: parseInt(birthDay),
                },
                ageRange,
                interest: interestList,
                createAt: new Date(),
                updateAt: new Date(),
            };

            // 保存到 Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);

            // 清除 localStorage
            localStorage.removeItem('registrationRole');

            // 重定向到首頁
            router.push('/square');
        } catch (err: any) {
            setError(err.message || '填寫資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const ageRangeOptions: SelectOption[] = [
        { value: '13-15', label: '13-15 歲' },
        { value: '16-18', label: '16-18 歲' },
        { value: '19-25', label: '19-25 歲' },
        { value: '26-35', label: '26-35 歲' },
        { value: '36-50', label: '36-50 歲' },
        { value: '50+', label: '50 歲以上' },
    ];

    const yearOptions: SelectOption[] = Array.from({ length: 50 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
    });

    const monthOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString().padStart(2, '0'),
    }));

    const dayOptions: SelectOption[] = Array.from({ length: 31 }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString().padStart(2, '0'),
    }));

    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
            </div>
        );
    }

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
                    <h1>完成您的檔案</h1>
                    <p>告訴我們更多關於您的資訊</p>

                    {error && (
                        <div className={styles.alert}>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Display Name */}
                        <Input
                            type="text"
                            label="顯示名稱"
                            placeholder="輸入您的暱稱"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            fullWidth
                            required
                        />

                        {/* Age Range */}
                        <Select
                            label="年齡範圍"
                            options={ageRangeOptions}
                            placeholder="選擇年齡範圍"
                            value={ageRange}
                            onChange={(e) => setAgeRange(e.target.value)}
                            fullWidth
                            required
                        />

                        {/* Birth Date */}
                        <div className={styles.birthDate}>
                            <label>出生日期 *</label>
                            <div className={styles.birthDateInputs}>
                                <Select
                                    options={yearOptions}
                                    placeholder="年"
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(e.target.value)}
                                    required
                                />
                                <Select
                                    options={monthOptions}
                                    placeholder="月"
                                    value={birthMonth}
                                    onChange={(e) => setBirthMonth(e.target.value)}
                                    required
                                />
                                <Select
                                    options={dayOptions}
                                    placeholder="日"
                                    value={birthDay}
                                    onChange={(e) => setBirthDay(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Interests */}
                        <Input
                            type="text"
                            label="興趣愛好"
                            placeholder="以逗號分隔多個興趣（例：音樂,運動,閱讀）"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            fullWidth
                            helperText="可選填"
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} className={styles.spinner} />
                                    建立檔案中...
                                </>
                            ) : (
                                '完成註冊'
                            )}
                        </Button>
                    </form>

                    <p className={styles.terms}>
                        繼續表示您同意我們的<Link href="#">服務條款</Link>和
                        <Link href="#">隱私政策</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}