'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui";
import { useArticles } from '@/lib/hooks/useArticles';
import styles from './page.module.css';
import { Loader, Heart } from "lucide-react";

export default function SquarePage () {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { articles, loading, error, fetchArticles } = useArticles();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [ user, authLoading, router ]);

    useEffect(() => {
        if (user) {
            fetchArticles();
        }
    }, [user, fetchArticles]);

    if (authLoading || loading) {
        return (
            <div className= {styles.loadingContainer}>
                <Loader size={40} className= {styles.spinner} />
            </div>
        );
    }

    return (
        <div className= {styles.loadingContainer}>
            {/* Header */}
            <div className= {styles.header}>
                <h1>心橋廣場</h1>
                <p>歡迎分享您的想法與傾聽他人的聲音</p>
                <Button onClick={() => router.push('/square/new')}>
                    <Heart size={20} />
                    分享文章
                </Button>
            </div>

            {/* Articles */}
            {error && (
                <div className= { styles.error }>
                    <p>{ error }</p>
                </div>
            )}

            {articles.length === 0 ? (
                <div className= { styles.empty }>
                    <Heart size={48} />
                    <h2>還沒有文章</h2>
                    <p>成為第一個分享的人吧！</p>
                    <Button onClick={() => router.push('/square/new')}>
                        開始分享
                    </Button>
                </div>
            ) : (
                <div className= { styles.articlesGrid }>
                    { articles.map((article) => (
                        <div key={ article.id } className={ styles.articleCard }>
                            <div onClick={() => router.push(`/article/${article.id}`)} style={{ cursor: 'pointer'}}>
                                <h3>{article.title}</h3>
                                <p>{article.content.substring(0, 100)}... </p>
                                <div className= { styles.meta}>
                                    <span> {article.authorName} </span>
                                    <span> {article.commentCount} </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}