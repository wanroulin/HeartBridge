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

                const commentsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Comment));

                setComments(commentsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : '獲取留言失敗');
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
            const commentsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Comment));

            setComments(commentsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : '獲取留言失敗');
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

            try {
                const newComment = {
                    articleId,
                    authorId: firebaseUser.uid,
                    authorName: user.displayName,
                    authorRole: user.role,
                    content,
                    likes: 0,
                    createAt: new Date(),
                    updateAt: new Date(),
                };

                const docRef = await addDoc(collection(db, 'comments'), newComment);
                return docRef.id;
            } catch (err) {
                throw err instanceof Error ? err : new Error('建立留言失敗');
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

            try {
                const commentRef = doc(db, 'comments', commentId);
                await updateDoc(commentRef, {
                    content,
                    updateAt: new Date(),
                });
            } catch (err) {
                throw err instanceof Error ? err : new Error('更新留言失敗');
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

            try {
                const commentRef = doc(db, 'comments', commentId);
                await deleteDoc(commentRef);

                setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            } catch (err) {
                throw err instanceof Error ? err : new Error('刪除留言失敗');
            }
        },
        [firebaseUser]
    );

    /**
     * 對留言點讚
     */
    const likeComment = useCallback(
        async (commentId: string) => {
            try {
                const commentRef = doc(db, 'comments', commentId);
                const commentToLike = comments.find((c) => c.id === commentId);

                if (commentToLike) {
                    await updateDoc(commentRef, {
                        likes: (commentToLike.likes || 0) + 1,
                        updateAt: new Date(),
                    });

                    setComments((prev) =>
                        prev.map((c) =>
                            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
                        )
                    );
                }
            } catch (err) {
                throw err instanceof Error ? err : new Error('點讚失敗');
            }
        },
        [comments]
    );

    return {
        comments,
        loading,
        error,
        fetchCommentsByArticle,
        fetchUserComments,
        createComment,
        updateComment,
        deleteComment,
        likeComment,
    };
}