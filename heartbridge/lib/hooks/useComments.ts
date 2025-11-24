'use client';

import { useCallback, useState } from 'react';
import { db } from '@/lib/firebase/config';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    QueryConstraint,
    serverTimestamp,
    increment,
} from 'firebase/firestore';
import { Comment } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseCommentsOptions {
    pageSize?: number;
}

export function useComments(options: UseCommentsOptions = {}) {
    const { pageSize = 20 } = options;
    const { firebaseUser, user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * 獲取文章的所有留言
     */
    const fetchCommentsByArticle = useCallback(
        async (articleId: string) => {
            setLoading(true);
            setError(null);
            try {
                const constraints: QueryConstraint[] = [
                    where('articleId', '==', articleId),
                    orderBy('createAt', 'desc'),
                    limit(pageSize),
                ];

                const q = query(collection(db, 'comments'), ...constraints);
                const snapshot = await getDocs(q);

                const commentsData = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        articleId: data.articleId,
                        authorId: data.authorId,
                        authorName: data.authorName,
                        authorRole: data.authorRole,
                        content: data.content,
                        likes: data.likes || 0,
                        createAt: data.createAt?.toDate?.() || new Date(data.createAt),
                        updateAt: data.updateAt?.toDate?.() || new Date(data.updateAt),
                    } as Comment;
                });

                setComments(commentsData);
            } catch (err) {
                const message = err instanceof Error ? err.message : '獲取留言失敗';
                setError(message);
                console.error('Error fetching comments:', err);
            } finally {
                setLoading(false);
            }
        },
        [pageSize]
    );

    /**
     * 獲取使用者的所有留言
     */
    const fetchUserComments = useCallback(async () => {
        if (!firebaseUser) return;

        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, 'comments'),
                where('authorId', '==', firebaseUser.uid),
                orderBy('createAt', 'desc'),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);
            const commentsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    articleId: data.articleId,
                    authorId: data.authorId,
                    authorName: data.authorName,
                    authorRole: data.authorRole,
                    content: data.content,
                    likes: data.likes || 0,
                    createAt: data.createAt?.toDate?.() || new Date(data.createAt),
                    updateAt: data.updateAt?.toDate?.() || new Date(data.updateAt),
                } as Comment;
            });

            setComments(commentsData);
        } catch (err) {
            const message = err instanceof Error ? err.message : '獲取留言失敗';
            setError(message);
            console.error('Error fetching user comments:', err);
        } finally {
            setLoading(false);
        }
    }, [firebaseUser, pageSize]);

    /**
     * 建立留言
     */
    const createComment = useCallback(
        async (articleId: string, content: string) => {
            if (!firebaseUser || !user) throw new Error('使用者未授權');
            if (!content.trim()) throw new Error('留言內容不能為空');

            setIsSubmitting(true);
            setError(null);

            try {
                // 先進行內容審查
                const { moderateContent } = await import('@/lib/ai/content-moderation');
                const moderationResult = await moderateContent(content);

                if (!moderationResult.isApproved && moderationResult.severity === 'high') {
                    throw new Error(
                        `您的留言包含不適合的內容。${moderationResult.suggestions.join('；')}`
                    );
                }

                const newComment = {
                    articleId,
                    authorId: firebaseUser.uid,
                    authorName: user.displayName,
                    authorRole: user.role,
                    content,
                    likes: 0,
                    createAt: serverTimestamp(),
                    updateAt: serverTimestamp(),
                };

                const docRef = await addDoc(collection(db, 'comments'), newComment);

                // 添加到本地狀態以實現樂觀更新
                const optimisticComment: Comment = {
                    id: docRef.id,
                    ...newComment,
                    createAt: new Date(),
                    updateAt: new Date(),
                } as Comment;

                setComments((prev) => [optimisticComment, ...prev]);

                return docRef.id;
            } catch (err) {
                const message = err instanceof Error ? err.message : '建立留言失敗';
                setError(message);
                throw err;
            } finally {
                setIsSubmitting(false);
            }
        },
        [firebaseUser, user]
    );

    /**
     * 更新留言
     */
    const updateComment = useCallback(
        async (commentId: string, content: string) => {
            if (!firebaseUser) throw new Error('使用者未授權');
            if (!content.trim()) throw new Error('留言內容不能為空');

            setError(null);

            try {
                // 先進行內容審查
                const { moderateContent } = await import('@/lib/ai/content-moderation');
                const moderationResult = await moderateContent(content);

                if (!moderationResult.isApproved && moderationResult.severity === 'high') {
                    throw new Error(
                        `您的留言包含不適合的內容。${moderationResult.suggestions.join('；')}`
                    );
                }

                const commentRef = doc(db, 'comments', commentId);
                await updateDoc(commentRef, {
                    content,
                    updateAt: serverTimestamp(),
                });

                // 本地更新
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === commentId ? { ...c, content, updateAt: new Date() } : c
                    )
                );
            } catch (err) {
                const message = err instanceof Error ? err.message : '更新留言失敗';
                setError(message);
                throw err;
            }
        },
        [firebaseUser]
    );

    /**
     * 刪除留言
     */
    const deleteComment = useCallback(
        async (commentId: string) => {
            if (!firebaseUser) throw new Error('使用者未授權');

            setError(null);

            try {
                const commentRef = doc(db, 'comments', commentId);
                await deleteDoc(commentRef);

                // 本地更新
                setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            } catch (err) {
                const message = err instanceof Error ? err.message : '刪除留言失敗';
                setError(message);
                throw err;
            }
        },
        [firebaseUser]
    );

    /**
     * 對留言點讚
     */
    const likeComment = useCallback(
        async (commentId: string) => {
            setError(null);

            try {
                const commentRef = doc(db, 'comments', commentId);
                const commentToLike = comments.find((c) => c.id === commentId);

                if (commentToLike) {
                    await updateDoc(commentRef, {
                        likes: increment(1),
                        updateAt: serverTimestamp(),
                    });

                    // 本地樂觀更新
                    setComments((prev) =>
                        prev.map((c) =>
                            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
                        )
                    );
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : '點讚失敗';
                setError(message);
                console.error('Error liking comment:', err);
            }
        },
        [comments]
    );

    return {
        comments,
        loading,
        isSubmitting,
        error,
        fetchCommentsByArticle,
        fetchUserComments,
        createComment,
        updateComment,
        deleteComment,
        likeComment,
    };
}