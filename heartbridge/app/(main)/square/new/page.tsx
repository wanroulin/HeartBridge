'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useArticles } from '@/lib/hooks/useArticles';
import { isValidArticleTitle, isValidArticleContent, cleanTags } from '@/lib/utils/validation';
import { Heart, Loader, ArrowLeft, Wand2, X } from 'lucide-react';
import styles from './page.module.css';

export default function NewArticlePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { createArticle, loading } = useArticles();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatingTags, setGeneratingTags] = useState(false);

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // 🔑 處理標籤輸入 - 空格觸發添加標籤
    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // 檢查是否有空格
        if (value.includes(' ')) {
            const parts = value.split(' ');
            // 最後一個是空的（因為末尾是空格），其他的是標籤
            const newTags = parts.slice(0, -1).filter(tag => tag.trim().length > 0);
            
            if (newTags.length > 0) {
                // 添加新標籤（去重）
                const uniqueTags = [...new Set([...tags, ...newTags])].slice(0, 10);
                setTags(uniqueTags);
                setTagInput(''); // 清空輸入框
            }
        } else {
            setTagInput(value);
        }
    };

    // 🔑 刪除標籤
    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    // 🔑 生成 AI 標籤
    const handleGenerateTags = async () => {
        if (!title.trim() && !content.trim()) {
            setError('請先輸入標題或內容');
            return;
        }

        setGeneratingTags(true);
        setError('');

        try {
            console.log('🤖 調用 AI 生成標籤...');

            const response = await fetch('/api/ai/generate-tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(`API 錯誤: ${response.status}`);
            }

            const data = await response.json();

            if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
                // 合併新標籤（去重且限制 10 個）
                const allTags = [...new Set([...tags, ...data.tags])].slice(0, 10);
                setTags(allTags);

                console.log('✅ AI 標籤已生成:', allTags);
            } else {
                setError('AI 未能生成標籤，請稍後重試');
            }
        } catch (err) {
            console.error('❌ 生成標籤失敗:', err);
            setError(
                err instanceof Error ? err.message : '生成標籤失敗，請檢查你的網路連接'
            );
        } finally {
            setGeneratingTags(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const articleId = await createArticle({
                title: title.trim(),
                content: content.trim(),
                tags: tags, // 直接使用標籤陣列
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

                {/* 🔑 Tags Section - 標籤輸入和按鈕在同一行 */}
                <div>
                    <label className={styles.label}>標籤 (可選)</label>
                    
                    <div className={styles.tagsInputWrapper}>
                        <div className={styles.tagInput}>
                            {tags.length > 0 && (
                                <div className={styles.tagsDisplay}>
                                    {tags.map((tag, index) => (
                                        <div key={index} className={styles.tagItem}>
                                            <span className={styles.tagText}>{tag}</span>
                                            <button
                                                type="button"
                                                className={styles.tagDeleteBtn}
                                                onClick={() => removeTag(index)}
                                                aria-label={`刪除標籤 ${tag}`}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                type="text"
                                className={styles.tagInputField}
                                placeholder={tags.length === 0 ? "輸入標籤後按空格添加..." : ""}
                                value={tagInput}
                                onChange={handleTagInputChange}
                            />
                        </div>
                        
                        <button
                            type="button"
                            className={styles.aiTagButton}
                            onClick={handleGenerateTags}
                            disabled={generatingTags || (!title.trim() && !content.trim())}
                            title="使用 AI 根據內容生成標籤"
                        >
                            {generatingTags ? (
                                <>
                                    <Loader size={16} className={styles.spinner} />
                                    <span>生成中...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={16} />
                                    <span>AI 生成標籤</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p className={styles.hint}>
                        {tags.length}/10 個標籤
                    </p>
                </div>

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
                            <>發佈文章</>
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
                        <li>輸入標籤後按空格添加，或使用 AI 生成標籤</li>
                        <li>尊重他人，避免使用攻擊性語言</li>
                        <li>分享真實想法，幫助建立理解橋樑</li>
                    </ul>
                </div>
            </form>
        </div>
    );
}