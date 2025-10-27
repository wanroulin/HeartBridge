'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useArticles } from '@/lib/hooks/useArticles';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Article } from '@/lib/types';
import { isValidArticleTitle, isValidArticleContent, cleanTags } from '@/lib/utils/validation';
import { Heart, Loader, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function EditArticlePage() {
    const params = useParams();
    const articleId = params.id as string;
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { updateArticle, loading: updating } = useArticles();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const doc_ = await getDoc(doc(db, 'articles', articleId));
            if (doc_.exists()) {
                const data = { id: doc_.id, ...doc_.data() } as Article;
                
                // 檢查是否是作者
                if (data.authorId !== user?.uid) {
                    setError('你沒有編輯此文章的權限');
                    return;
                }

                setArticle(data);
                setTitle(data.title);
                setContent(data.content);
                setTags(data.tags.join(', '));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 驗證
        if (!isValidArticleTitle(title)) {
            setError('標題長度必須在 5-200 個字符之間');
            return;
        }

        if (!isValidArticleContent(content)) {
            setError('內容長度必須在 20-10000 個字符之間');
            return;
        }

        const tagList = cleanTags(tags.split(','));

        try {
            await updateArticle(articleId, {
                title: title.trim(),
                content: content.trim(),
                tags: tagList,
            } as any);

            setSuccess('文章更新成功！');
            setTimeout(() => {
                router.push(`/article/${articleId}`);
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新文章失敗');
        }
    };

    if (loading || authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
            </div>
        );
    }

    if (error && !article) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <h2>發生錯誤</h2>
                    <p>{error}</p>
                    <Link href="/square">
                        <Button>返回廣場</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href={`/article/${articleId}`} className={styles.backLink}>
                    <ArrowLeft size={20} />
                    返回
                </Link>
                <h1>編輯文章</h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className={styles.alert} style={{ backgroundColor: '#FEE', borderColor: 'var(--error)', color: 'var(--error)' }}>
                    <p>{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className={styles.alert} style={{ backgroundColor: '#EFE', borderColor: 'var(--success)', color: 'var(--success)' }}>
                    <p>✓ {success}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Title */}
                <div>
                    <Input
                        type="text"
                        label="標題"
                        placeholder="輸入文章標題 (5-200 字符)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                    />
                    <p className={styles.hint}>
                        {title.length}/200
                    </p>
                </div>

                {/* Content */}
                <div>
                    <Textarea
                        label="內容"
                        placeholder="輸入文章內容 (20-10000 字符)..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={12}
                        fullWidth
                        required
                    />
                    <p className={styles.hint}>
                        {content.length}/10000
                    </p>
                </div>

                {/* Tags */}
                <Input
                    type="text"
                    label="標籤 (可選)"
                    placeholder="以逗號分隔多個標籤 (例：親子,溝通,教養)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    fullWidth
                    helperText="最多 10 個標籤，每個最多 50 個字符"
                />

                {/* Note */}
                <div className={styles.note}>
                    <strong>提示：</strong>編輯後，原始發佈日期將保持不變。新增的編輯時間將記錄在系統中。
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        disabled={updating || !title || !content}
                    >
                        {updating ? (
                            <>
                                <Loader size={18} className={styles.spinner} />
                                保存中...
                            </>
                        ) : (
                            <>
                                <Heart size={20} />
                                保存變更
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={() => router.back()}
                        disabled={updating}
                    >
                        取消
                    </Button>
                </div>
            </form>
        </div>
    );
}