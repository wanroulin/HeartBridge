'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './ArticleDetail.module.css';
import { CommentSection } from '@/components/ui/Comments/CommentSection';
import { Article, Comment, UserRole } from '@/lib/types';
import { Heart, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// 模擬 API 調用
async function fetchArticle(id: string): Promise<Article> {
  // 實際應使用 Firebase
  return {
    id,
    authorId: 'user123',
    authorName: 'parent',
    title: '如何與青少年溝通？',
    content: `這是一篇關於親子溝通的文章。

隨著孩子的成長，親子之間的溝通變得越來越重要。許多家長發現，孩子進入青春期後變得不太願意分享自己的想法和感受。這種變化是正常的發展現象，但也是改善溝通的好機會。

有效的溝通需要雙方的努力和理解。作為家長，我們需要：

1. 傾聽而不是批評
2. 表達關心而不是控制
3. 給予空間而不是逃避
4. 建立信任而不是懷疑

希望透過這個平台，我們能夠相互學習，一起找到更好的溝通方式。`,
    tags: ['溝通', '青少年', '家庭'],
    likes: 234,
    commentCount: 12,
    createAt: new Date('2024-01-15'),
    updateAt: new Date('2024-01-15'),
  };
}

// 模擬留言數據
async function fetchComments(articleId: string): Promise<Comment[]> {
  return [
    {
      id: 'comment1',
      articleId,
      authorId: 'user456',
      authorName: '小明',
      authorRole: 'teen',
      content: '這篇文章很有幫助！我現在更理解家長的想法了。',
      likes: 15,
      createAt: new Date(Date.now() - 3600000), // 1 小時前
      updateAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'comment2',
      articleId,
      authorId: 'user789',
      authorName: '王媽媽',
      authorRole: 'parent',
      content: '非常同意！傾聽確實是最重要的。我最近開始嘗試不先下判斷，真的有改善。',
      likes: 28,
      createAt: new Date(Date.now() - 7200000), // 2 小時前
      updateAt: new Date(Date.now() - 7200000),
    },
    {
      id: 'comment3',
      articleId,
      authorId: 'user101',
      authorName: '小花',
      authorRole: 'teen',
      content: '我希望家長能多給我們一些時間和空間，不是所有事情都要立即解決。',
      likes: 42,
      createAt: new Date(Date.now() - 10800000), // 3 小時前
      updateAt: new Date(Date.now() - 10800000),
    },
  ];
}

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUserRole] = useState<UserRole>('parent'); // 實際應從 auth context 取得
  const [currentUserId] = useState('current-user-id'); // 實際應從 auth context 取得

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [articleData, commentsData] = await Promise.all([
          fetchArticle(articleId),
          fetchComments(articleId),
        ]);
        setArticle(articleData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [articleId]);

  const handleSubmitComment = async (content: string) => {
    try {
      setIsSubmitting(true);

      // 模擬 API 調用
      const newComment: Comment = {
        id: `comment${Date.now()}`,
        articleId,
        authorId: currentUserId,
        authorName: currentUserRole === 'parent' ? '我' : '我',
        authorRole: currentUserRole,
        content,
        likes: 0,
        createAt: new Date(),
        updateAt: new Date(),
      };

      setComments([...comments, newComment]);

      // 實際應更新文章的 commentCount
      if (article) {
        setArticle({
          ...article,
          commentCount: article.commentCount + 1,
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    // 模擬 API 調用
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likes + 1 }
          : c
      )
    );
  };

  const handleLikeArticle = () => {
    setIsLiked(!isLiked);
    // 實際應呼叫 API 更新點讚數
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div
          style={{
            width: '2rem',
            height: '2rem',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        找不到文章
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 返回按鈕 */}
      <Link href="/app/square" className={styles.backButton}>
        <ArrowLeft size={20} />
        <span>返回</span>
      </Link>

      {/* 文章內容區 */}
      <article className={styles.articleContent}>
        <header className={styles.articleHeader}>
          <h1 className={styles.title}>{article.title}</h1>

          <div className={styles.metadata}>
            <div className={styles.author}>
              <span className={styles.authorRole}>
                {article.authorName === 'parent' ? '👨‍👩‍👧' : '👦'}{' '}
                {article.authorName === 'parent' ? '家長' : '青少年'}
              </span>
              <span className={styles.date}>
                {article.createAt.toLocaleDateString('zh-TW')}
              </span>
            </div>

            <div className={styles.tags}>
              {article.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className={styles.body}>
          {article.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} style={{ whiteSpace: 'pre-wrap' }}>
                {paragraph}
              </p>
            )
          ))}
        </div>

        <footer className={styles.articleFooter}>
          <button
            className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
            onClick={handleLikeArticle}
          >
            <Heart
              size={18}
              fill={isLiked ? 'currentColor' : 'none'}
            />
            <span>{article.likes}</span>
          </button>

          <button className={styles.actionButton}>
            <Share2 size={18} />
            <span>分享</span>
          </button>

          <div className={styles.commentCount}>
            💬 {comments.length} 則留言
          </div>
        </footer>
      </article>

      {/* 留言區 */}
      <section className={styles.commentsSection}>
        <CommentSection
          articleId={articleId}
          comments={comments}
          currentUserRole={currentUserRole}
          onSubmitComment={handleSubmitComment}
          onLikeComment={handleLikeComment}
          isLoading={false}
          isSubmitting={isSubmitting}
          currentUserId={currentUserId}
        />
      </section>
    </div>
  );
}