'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/lib/hooks/useComments';
import { CommentSection } from '@/components/ui/Comments/CommentSection';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { Article } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { formatRoleName } from '@/lib/utils/format';
import { Heart, MessageCircle, Share2, Loader, ArrowLeft, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css'

export default function ArticleDetailPage() {
    const params = useParams();
    const articleId = params.id as string;
    const router = useRouter();
    const { user } = useAuth();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userLikedArticle, setUserLikedArticle] = useState(false);
    const [isLikingArticle, setIsLikingArticle] = useState(false);

    const {
        comments,
        isSubmitting,
        fetchCommentsByArticle,
        createComment,
        deleteComment,
        likeComment,
    } = useComments();

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

    useEffect(() => {
        if (article) {
            fetchCommentsByArticle(article.id);
        }
    }, [article, fetchCommentsByArticle]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const articleDoc = await getDoc(doc(db, 'articles', articleId));
            if (articleDoc.exists()) {
                const data = articleDoc.data();
                setArticle({
                    id: articleDoc.id,
                    ...data,
                    createAt: data.createAt?.toDate?.() || new Date(data.createAt),
                    updateAt: data.updateAt?.toDate?.() || new Date(data.updateAt),
                } as Article);
            } else {
                setError('文章不存在');
            }
        } catch (err) {
            setError('載入文章失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (content: string) => {
        if (!user) {
            setError('請先登入');
            return;
        }

        try {
            await createComment(articleId, content);

            // 更新文章的留言計數
            const articleRef = doc(db, 'articles', articleId);
            await updateDoc(articleRef, {
                commentCount: increment(1),
                updateAt: serverTimestamp(),
            });

            if (article) {
                setArticle({
                    ...article,
                    commentCount: article.commentCount + 1,
                });
            }

            // 重新取得留言
            await fetchCommentsByArticle(articleId);
        } catch (err) {
            setError(err instanceof Error ? err.message : '留言提交失敗');
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user) {
            setError('請先登入');
            return;
        }

        try {
            await likeComment(commentId);
        } catch (err) {
            setError('操作失敗');
        }
    };

    const handleLikeArticle = async () => {
        if (!article || !user) {
            setError('請先登入');
            return;
        }

        setIsLikingArticle(true);
        try {
            const articleRef = doc(db, 'articles', articleId);
            const newLikeCount = article.likes + (userLikedArticle ? -1 : 1);

            await updateDoc(articleRef, {
                likes: newLikeCount,
                updateAt: serverTimestamp(),
            });

            setArticle({
                ...article,
                likes: newLikeCount,
            });

            setUserLikedArticle(!userLikedArticle);
        } catch (err) {
            setError('按讚失敗');
            console.error(err);
        } finally {
            setIsLikingArticle(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('確定要刪除這篇文章嗎？')) return;

        try {
            await (await import('firebase/firestore')).deleteDoc(
                doc(db, 'articles', articleId)
            );
            router.push('/square');
        } catch (err) {
            setError('刪除文章失敗');
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/square/${articleId}`;
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                text: article?.content.substring(0, 100),
                url: url,
            });
        } else {
            alert('複製連結：' + url);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
            </div>
        );
    }

    if (!article) {
        return (
            <div className={styles.error}>
                <h2>發生錯誤</h2>
                <p>{error || '文章載入失敗'}</p>
                <Link href="/square">
                    <ArrowLeft size={20} />
                </Link>
            </div>
        );
    }

    const isAuthor = user?.uid === article.authorId;

    return (
        <div className={styles.container}>
            {/* 返回按鈕 */}
            <Link href="/square" className={styles.backButton}>
                <ArrowLeft size={20} />
                <span>返回</span>
            </Link>

            {/* 文章內容區 */}
            <article className={styles.article}>
                <header className={styles.titleSection}>
                    <div className={styles.titleHeader}>
                        <h1>{article.title}</h1>
                        <div className={styles.actionButtons}>
                            <button
                                onClick={handleShare}
                                className={styles.stat}
                                title="分享"
                            >
                                <Share2 size={18} />
                            </button>

                            {isAuthor && (
                                <>
                                    <button
                                        onClick={() => router.push(`/square/edit/${articleId}`)}
                                        className={styles.stat}
                                        title="編輯"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className={styles.stat}
                                        title="刪除"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.meta}>
                        <span className={styles.role}>
                            {formatRoleName(article.authorName)}
                        </span>
                        <span className={styles.date}>
                            {formatRelativeTime(article.createAt)}
                        </span>
                    </div>
                </header>

                <div className={styles.content}>
                    {article.content.split('\n').map((paragraph, i) => (
                        paragraph.trim() && (
                            <p key={i}>
                                {paragraph}
                            </p>
                        )
                    ))}

                    <div className={styles.tags}>
                        {article.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                <footer className={styles.stats}>
                    <button
                        onClick={handleLikeArticle}
                        disabled={isLikingArticle}
                        className={styles.stat}
                    >
                        <Heart
                            size={18}
                            fill={userLikedArticle ? 'currentColor' : 'none'}
                        />
                        <span>{article.likes}</span>
                    </button>

                    <div className={styles.commentCount}>   
                        <MessageCircle size={18} /> 
                        <span> {article.commentCount}</span>
                    </div>
                </footer>
            </article>

            {/* 留言區 */}
            <section className={styles.commentsSection}>
                {error && (
                    <div className={styles.errorAlert}>
                        {error}
                    </div>
                )}
                <CommentSection
                    articleId={articleId}
                    comments={comments}
                    currentUserRole={user?.role || 'teen'}
                    onSubmitComment={handleSubmitComment}
                    onLikeComment={handleLikeComment}
                    isLoading={false}
                    isSubmitting={isSubmitting}
                    currentUserId={user?.uid}
                />
            </section>
        </div>
    );
}