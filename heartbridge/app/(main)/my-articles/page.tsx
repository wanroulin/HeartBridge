'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { Heart, Loader, Edit, Trash2 } from 'lucide-react';
import { useArticles } from '@/lib/hooks/useArticles';
import styles from './page.module.css';

export default function MyArticlesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { articles, loading, error, fetchUserArticles, deleteArticle } = useArticles();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchUserArticles();
        }
    }, [user, fetchUserArticles]);

    const handleDelete = async (articleId: string) => {
        if (confirm('確定要刪除這篇文章嗎？')) {
            try {
                await deleteArticle(articleId);
            } catch (err) {
                console.error('Delete error:', err);
            }
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
                <h1>我的文章</h1>
                <Button onClick={() => router.push('/square/new')}>
                    <Heart size={20} />
                    新增文章
                </Button>
            </div>

            {/* Articles */}
            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                </div>
            )}

            {articles.length === 0 ? (
                <div className={styles.empty}>
                    <Heart size={48} />
                    <h2>還沒有文章</h2>
                    <p>開始分享您的想法吧！</p>
                    <Button onClick={() => router.push('/square/new')}>
                        新增文章
                    </Button>
                </div>
            ) : (
                <div className={styles.articlesList}>
                    {articles.map((article) => (
                        <div key={article.id} className={styles.articleItem}>
                            <div className={styles.articleContent}>
                                <h3>{article.title}</h3>
                                <p>{article.content.substring(0, 150)}...</p>
                                <div className={styles.meta}>
                                    <span>📝 {article.commentCount} 則留言</span>
                                    <span>❤️ {article.likes} 人按讚</span>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={() => router.push(`/square/edit/${article.id}`)}
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={() => handleDelete(article.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}