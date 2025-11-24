'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageSquare, Loader } from 'lucide-react';
import { getSavedArticles } from '@/lib/services/articleSaveService';
import { Article } from '@/lib/types';
import styles from './page.module.css';

export default function MyFavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user]);

    const loadFavorites = async () => {
        if (!user) return;
        
        setLoading(false);
        try {
            const savedArticles = await getSavedArticles(user.uid);
            setArticles(savedArticles);
        } catch (err) {
            console.error('加載收藏失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>❤️ 我的收藏</h1>
                <p>{articles.length} 篇文章</p>
            </div>

            {articles.length === 0 ? (
                <div className={styles.empty} style={{ 
                    textAlign: 'center', 
                    padding: '3rem 1rem',
                    marginTop: '3rem'
                }}>
                    <Heart size={48} />
                    <h2>還沒有收藏</h2>
                    <p>瀏覽文章並點擊 bookmark 來收藏</p>
                </div>
            ) : (
                <div className={styles.articlesGrid}>
                    {articles.map((article) => (
                        <div key={article.id} className={styles.articleCard}>
                            <div onClick={() => router.push(`/square/${article.id}`)} style={{ cursor: 'pointer' }}>
                                <div className={styles.meta}>
                                    <span>{article.authorName === 'parent' ? '👨‍👩‍👧 家長' : '👦 青少年'}</span>
                                </div>
                                <h3>{article.title}</h3>
                                <p>{article.content.substring(0, 100)}...</p>

                                <div className={styles.info}>
                                    <span><Heart size={16} /> {article.likes || 0}</span>
                                    <span><MessageSquare size={16} /> {article.commentCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}