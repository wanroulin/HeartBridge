'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useArticles } from '@/lib/hooks/useArticles';
import { isValidArticleTitle, isValidArticleContent, cleanTags } from '@/lib/utils/validation';
import { Heart, Loader, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function NewArticlePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { createArticle, loading } = useArticles();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const tagList = cleanTags(tags.split(','));

        try {
            const articleId = await createArticle({
                title: title.trim(),
                content: content.trim(),
                tags: tagList,
                authorName: user?.role || 'teen',
                authorId: user?.uid || 'defaultId',
            });

            setSuccess('文章發佈成功！');
            setTimeout(() => {
                router.push(`/article/${articleId}`);
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '發佈文章失敗');
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
                <Link href="/square" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    返回
                </Link>
                <h1>發佈新文章</h1>
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

                {/* Actions */}
                <div className={styles.actions}>
                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        disabled={loading || !title || !content}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className={styles.spinner} />
                                發佈中...
                            </>
                        ) : (
                            <>
                                發佈文章
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        取消
                    </Button>
                </div>

                {/* Tips */}
                <div className={styles.tips}>
                    <h3>發佈提示</h3>
                    <ul>
                        <li>請確保標題清晰、能吸引讀者</li>
                        <li>詳細描述你的想法和經驗</li>
                        <li>使用適當的標籤方便其他人搜尋</li>
                        <li>尊重他人，避免使用攻擊性語言</li>
                        <li>分享真實想法，幫助建立理解橋樑</li>
                    </ul>
                </div>
            </form>
        </div>
    );
}