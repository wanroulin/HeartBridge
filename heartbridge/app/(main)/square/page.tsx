'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui";
import { useArticles } from '@/lib/hooks/useArticles';
import styles from './page.module.css';
import { Loader, Heart, MessageSquare } from "lucide-react";

export default function SquarePage () {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { articles, loading, error, fetchArticles } = useArticles();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
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
            </div>

            {/* Articles */}
            {error && (
                <div className= { styles.error }>
                    <p>{ error }</p>
                </div>
            )}

            
                <div className= { styles.articlesGrid }>
                    { articles.map((article) => (
                        <div key={ article.id } className={ styles.articleCard }>
                            <div onClick={() => router.push(`/article/${article.id}`)} style={{ cursor: 'pointer'}}>
                                <div className= {styles.meta}>
                                    <span> {article.authorName} </span>
                                </div>
                                <h3>{article.title}</h3>
                                <p>{article.content.substring(0, 100)}... </p>

                                <div className={styles.info}>
                                    <span> <Heart size={16} /> {article.likes}</span>
                                    <span> <MessageSquare size={16} /> {article.commentCount}</span>
                                </div>
                                
                            </div>
                        </div>
                    ))}
                </div>

                <Button onClick={() => router.push('/square/new')}>
                        開始分享
                    </Button>
            
        </div>
    );
}