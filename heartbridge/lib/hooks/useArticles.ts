'use client';

import { useCallback, useState } from "react";
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
    DocumentData,
    QueryConstraint,
    startAfter,
    serverTimestamp,
} from 'firebase/firestore';
import { Article } from "@/lib/types";
import { useAuth }from '@/contexts/AuthContext';

interface UseArticlesOptions {
    pageSize?: number;
}

export function useArticles(options: UseArticlesOptions = {}) {
    const { pageSize = 10 } = options;
    const { firebaseUser } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);


    /** 獲取所有文章 */
    const fetchArticles = useCallback (
        async (filters ?: {role?: 'parent' | 'teen'; tags ?: string[] }) => {
            setLoading(true);
            setError(null);
            try {
                const constraints: QueryConstraint[] = [orderBy('createAt', 'desc'), limit(pageSize)];

                if (filters?.role) {
                    constraints.push(where('authoeName', '==', filters.role));
                }

                const q = query(collection(db, 'articles'), ...constraints);
                const snapshot = await getDocs(q);

                const articlesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Article));

                setArticles(articlesData);
                setLastDoc(snapshot.docs[snapshot.docs.length -1]);
                setHasMore(snapshot.docs.length === pageSize);
            } catch (err) {
                setError(err instanceof Error ? err.message : '獲取文章失敗');
            } finally {
                setLoading(false);
            }
        },
        [pageSize]
    );

    /** 獲取使用者文章 */
    const fetchUserArticles = useCallback(async () => {
        if (!firebaseUser) return;

        setLoading(true);
        setError(null);
        try {
            const q = query (
                collection( db, 'articles'),
                where('authorId', '==', firebaseUser.uid),
                orderBy('createAt', 'desc'),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);
            const articlesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Article));

            setArticles(articlesData);
            setLastDoc(snapshot.docs[snapshot.docs.length -1]);
            setHasMore(snapshot.docs.length === pageSize);
        } catch (err) {
            setError(err instanceof Error ? err.message : '提取文章失敗');
        } finally {
            setLoading(false);
        }
    }, [firebaseUser, pageSize]);

    /** 加載更多文章 */
    const loadMore = useCallback(async () => {
        if (!hasMore || !lastDoc) return;

        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [
                orderBy('createAt', 'desc'),
                startAfter(lastDoc),
                limit(pageSize),
            ];

            const q = query(collection(db, 'articles'), ...constraints);
            const snapshot = await getDocs(q);

            const newArticles = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Article));

            setArticles((prev) => [...prev, ...newArticles]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === pageSize);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加載失敗');
        } finally {
            setLoading(false);
        }
    }, [hasMore, lastDoc, pageSize]);

    /** 建立文章 */
    const createArticle = useCallback(
        async (article: Omit<Article, 'id' | 'createAt' | 'updateAt' | 'likes' | 'commentCount'>) => {
            if (!firebaseUser) throw new Error('使用者未授權');

            try {
                const newArticle = {
                    ...article,
                    authorId: firebaseUser.uid,
                    likes: 0,
                    commentCount: 0,
                    createAt: new Date(),
                    updateAt: new Date(),
                };

                const docRef = await addDoc(collection(db, 'articles'), newArticle);
                return docRef.id;
            } catch (err) {
                throw err instanceof Error ? err : new Error('建立文章失敗');
            }
        },
        [firebaseUser]
    );

    /** 更新文章 */
    const updateArticle = useCallback (
        async (articleId: string, updates: Partial<Article>) => {
            if (!firebaseUser) throw new Error('使用者未授權');

            try {
                const articleRef = doc(db, 'articles', articleId);
                await updateDoc (articleRef, {
                    ...updates,
                    updateAt: new Date(),
                });
            } catch (err) {
                throw err instanceof Error ? err : new Error('更新文章失敗');
            }
        },
        [firebaseUser]
    );

    /**
     * 刪除文章
     */
    const deleteArticle = useCallback(
        async (articleId: string) => {
            if (!firebaseUser) throw new Error('使用者未授權');

            try {
                const articleRef = doc(db, 'articles', articleId);
                await deleteDoc(articleRef);

                setArticles((prev) => prev.filter((article) => article.id !== articleId));
            } catch (err) {
                throw err instanceof Error ? err : new Error('刪除文章失敗');
            }
        },
        [firebaseUser]
    );

    return {
        articles,
        loading,
        error,
        hasMore,
        fetchArticles,
        fetchUserArticles,
        loadMore,
        createArticle,
        updateArticle,
        deleteArticle,
    };
}
