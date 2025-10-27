'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Loader } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Favorite, Article } from '@/lib/types';
import styles from './page.module.css';

export default function MyFavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<(Favorite & { article: Article })[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            const favData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Favorite));

            setFavorites(favData as any);
        } catch (err) {
            setError(err instanceof Error ? err.message : '獲取收藏失敗');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1>我的收藏</h1>
                <p>保存您喜歡的文章和想法</p>
            </div>

            {/* Favorites */}
            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                </div>
            )}

            {favorites.length === 0 ? (
                <div className={styles.empty}>
                    <Heart size={48} />
                    <h2>還沒有收藏</h2>
                    <p>按讚或收藏喜歡的文章吧！</p>
                </div>
            ) : (
                <div className={styles.favoritesList}>
                    {favorites.map((fav) => (
                        <div key={fav.id} className={styles.favoriteItem}>
                            <div
                                onClick={() => router.push(`/article/${fav.articleId}`)}
                                style={{ cursor: 'pointer', flex: 1 }}
                            >
                                <h3>文章 #{fav.articleId}</h3>
                                <p>已收藏於 {new Date(fav.createAt.toString()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}