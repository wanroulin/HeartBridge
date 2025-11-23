'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui";
import { useArticles } from '@/lib/hooks/useArticles';
import styles from './page.module.css';
import { Loader, Heart, MessageSquare, Search, Plus } from "lucide-react";

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
                <div className={styles.headerLeft}>
                    <h2>心橋廣場</h2>
                </div>

                <form
                    className={styles.searchForm}
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const input = form.querySelector('input[name="q"]') as HTMLInputElement;
                        const q = input?.value || '';
                        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
                    }}
                >
                    <input name="q" className={styles.searchInput} type="text" placeholder="搜尋文章..." />
                    <button type="submit" className={styles.searchBtn} aria-label="搜尋">
                        <Search size={18} />
                    </button>
                </form>
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

                <button
                    className={styles.fabBtn}
                    onClick={() => router.push('/square/new')}
                    aria-label="新增文章"
                >
                    <Plus size={32} />
                </button>
            
        </div>
    );
}