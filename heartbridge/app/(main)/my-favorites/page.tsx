'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Loader, ArrowLeft, MessageCircle } from 'lucide-react';
import { getSavedArticles } from '@/lib/services/articleSaveService';
import { Article } from '@/lib/types';
import Link from 'next/link';
import styles from './page.module.css';

export default function MyFavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 檢查認證
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // 載入收藏
    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user]);

    const loadFavorites = async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        try {
            const articles = await getSavedArticles(user.uid);
            setFavorites(articles);
        } catch (err) {
            console.error('加載收藏失敗:', err);
            setError('加載收藏失敗，請稍後重試');
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
            {/* 返回按鈕 */}
            <Link href="/square" className={styles.backButton}>
                <ArrowLeft size={20} />
                <span>返回</span>
            </Link>

            {/* 標題 */}
            <div style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    ❤️ 我的收藏
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    {favorites.length} 篇已收藏
                </p>
            </div>

            {/* 錯誤訊息 */}
            {error && (
                <div style={{ 
                    padding: '1rem 1.5rem',
                    maxWidth: '900px',
                    margin: '0 auto',
                    width: '100%',
                    color: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderRadius: '0.5rem',
                    border: '1px solid #f44336'
                }}>
                    {error}
                </div>
            )}

            {/* 空狀態 */}
            {favorites.length === 0 ? (
                <div style={{ 
                    padding: '4rem 1.5rem',
                    textAlign: 'center',
                    maxWidth: '900px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <Heart size={80} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>還沒有收藏</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        瀏覽文章並點擊 ❤️ 將喜歡的文章加入收藏
                    </p>
                    <Link 
                        href="/square"
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 2rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            fontWeight: 500
                        }}
                    >
                        瀏覽文章
                    </Link>
                </div>
            ) : (
                // 文章列表
                <div style={{ 
                    padding: '1.5rem',
                    maxWidth: '900px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {favorites.map((article) => (
                        <article
                            key={article.id}
                            onClick={() => router.push(`/square/${article.id}`)}
                            style={{
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                        >
                            {/* 標題和角色 */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h2 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 700, 
                                    margin: '0 0 0.75rem 0',
                                    color: 'var(--text-primary)'
                                }}>
                                    {article.title}
                                </h2>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderRadius: '1rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                    }}>
                                        {article.authorName === 'parent' ? '👨‍👩‍👧 家長' : '👦 青少年'}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                        {new Date(article.createAt).toLocaleDateString('zh-TW')}
                                    </span>
                                </div>
                            </div>

                            {/* 標籤 */}
                            {article.tags && article.tags.length > 0 && (
                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '0.75rem',
                                    marginBottom: '1rem'
                                }}>
                                    {article.tags.map((tag) => (
                                        <span 
                                            key={tag}
                                            style={{
                                                padding: '0.375rem 0.75rem',
                                                backgroundColor: 'var(--bg-tertiary)',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.8rem',
                                                color: 'var(--primary)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* 內容預覽 */}
                            <div style={{
                                fontSize: '1rem',
                                lineHeight: '1.8',
                                color: 'var(--text-primary)',
                                marginBottom: '1rem',
                                maxHeight: '120px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {article.content}
                            </div>

                            {/* 統計 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.95rem'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Heart size={18} fill="currentColor" />
                                    {article.likes || 0} 人按讚
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageCircle size={18} />
                                    {article.commentCount || 0} 則留言
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}