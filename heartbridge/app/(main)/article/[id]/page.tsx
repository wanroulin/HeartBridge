'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useArticles } from '@/lib/hooks/useArticles';
import { useComments } from '@/lib/hooks/useComments';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Article } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { formatRoleName } from '@/lib/utils/format';
import { Heart, MessageCircle, Share2, Loader, ArrowLeft, Trash2, Edit } from 'lucide-react';
import styles from './page.module.css';

export default function ArticleDetailPage() {
    const params = useParams();
    const articleId = params.id as string;
    const router = useRouter();
    const { user } = useAuth();
    
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { deleteArticle } = useArticles();
    const { comments, fetchCommentsByArticle } = useComments();
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

    useEffect(() => {
        if (article) {
            fetchCommentsByArticle(article.id);
        }
    }, [article]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const articleDoc = await getDoc(doc(db, 'articles', articleId));
            if (articleDoc.exists()) {
                setArticle({
                    id: articleDoc.id,
                    ...articleDoc.data(),
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

    const handleDelete = async () => {
        if (confirm('確定要刪除這篇文章嗎？')) {
            try {
                await deleteArticle(articleId);
                router.push('/square');
            } catch (err) {
                setError('刪除文章失敗');
            }
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/article/${articleId}`;
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

    if (!article || error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>發生錯誤</h2>
                    <p>{error || '文章載入失敗'}</p>
                    <Link href="/square">
                        <Button>返回廣場</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isAuthor = user?.uid === article.authorId;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/square" className={styles.backButton}>
                    <ArrowLeft size={20} />
                    返回廣場
                </Link>
            </div>

            {/* Article */}
            <article className={styles.article}>
                {/* Title and Meta */}
                <div className={styles.titleSection}>
                    <h1>{article.title}</h1>
                    <div className={styles.meta}>
                        <span className={styles.role}>
                            {formatRoleName(article.authorName as any)}
                        </span>
                        <span className={styles.date}>
                            {formatRelativeTime(article.createAt.toString())}
                        </span>
                        <span className={styles.date}>
                            {formatDate(article.createAt.toString())}
                        </span>
                    </div>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className={styles.tags}>
                        {article.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className={styles.content}>
                    {article.content}
                </div>

                {/* Stats */}
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <Heart size={18} />
                        <span>{article.likes} 人按讚</span>
                    </div>
                    <div className={styles.stat}>
                        <MessageCircle size={18} />
                        <span>{article.commentCount} 則留言</span>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Button variant="outline" size="md" onClick={handleShare}>
                        <Share2 size={18} />
                        分享
                    </Button>
                    {isAuthor && (
                        <>
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => router.push(`/square/edit/${articleId}`)}
                            >
                                <Edit size={18} />
                                編輯
                            </Button>
                            <Button
                                variant="outline"
                                size="md"
                                onClick={handleDelete}
                            >
                                <Trash2 size={18} />
                                刪除
                            </Button>
                        </>
                    )}
                </div>
            </article>

            {/* Comments Section */}
            <section className={styles.commentsSection}>
                <h2>留言 ({article.commentCount})</h2>

                {/* Comment Input */}
                {user && (
                    <div className={styles.commentForm}>
                        <textarea
                            placeholder="分享你的想法..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={3}
                        />
                        <Button
                            size="md"
                            disabled={submittingComment || !commentText.trim()}
                            onClick={async () => {
                                setSubmittingComment(true);
                                try {
                                    // 留言提交邏輯待實現
                                    setCommentText('');
                                } finally {
                                    setSubmittingComment(false);
                                }
                            }}
                        >
                            {submittingComment ? '提交中...' : '提交留言'}
                        </Button>
                    </div>
                )}

                {/* Comments List */}
                <div className={styles.commentsList}>
                    {comments.length === 0 ? (
                        <p className={styles.noComments}>還沒有留言，成為第一個吧！</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className={styles.comment}>
                                <div className={styles.commentHeader}>
                                    <div className={styles.commentAuthor}>
                                        <span className={styles.name}>{comment.authorName}</span>
                                        <span className={styles.role}>
                                            {formatRoleName(comment.authorRole)}
                                        </span>
                                    </div>
                                    <span className={styles.time}>
                                        {formatRelativeTime(comment.createAt.toString())}
                                    </span>
                                </div>
                                <p className={styles.commentContent}>{comment.content}</p>
                                <div className={styles.commentFooter}>
                                    <button className={styles.likeButton}>
                                        <Heart size={14} />
                                        {comment.likes}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}