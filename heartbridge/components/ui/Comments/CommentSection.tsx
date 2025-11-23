'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import styles from './CommentSection.module.css';
import { Comment, UserRole } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
  currentUserRole: UserRole;
  onSubmitComment: (content: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  currentUserId?: string;
}

export function CommentSection({
  articleId,
  comments,
  currentUserRole,
  onSubmitComment,
  onLikeComment,
  isLoading = false,
  isSubmitting = false,
  currentUserId,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const MAX_LENGTH = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      await onSubmitComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleLike = async (commentId: string) => {
    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);

    if (onLikeComment) {
      try {
        await onLikeComment(commentId);
      } catch (error) {
        console.error('Error liking comment:', error);
        // 恢復狀態
        setLikedComments(likedComments);
      }
    }
  };

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { 
        addSuffix: true,
        locale: zhTW,
      });
    } catch {
      return '剛剛';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === 'parent') {
      return { text: '我是家長', className: styles.authorBadge + ' ' + styles.parent };
    } else {
      return { text: '我是青少年', className: styles.authorBadge + ' ' + styles.teen };
    }
  };

  return (
    <div className={styles.container}>
      {/* 留言列表 */}
      <div className={styles.commentsWrapper}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : comments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <div className={styles.emptyText}>
              還沒有留言，成為第一個分享想法的人吧
            </div>
          </div>
        ) : (
          comments.map((comment) => {
            const badge = getRoleBadge(comment.authorRole);
            const isLiked = likedComments.has(comment.id);

            return (
              <div key={comment.id} className={styles.comment}>
                {/* 留言頭部 */}
                <div className={styles.commentHeader}>
                  <div className={styles.authorInfo}>
                    <span className={badge.className}>{badge.text}</span>
                    <span className={styles.authorName}>{comment.authorName}</span>
                    <span className={styles.commentTime}>
                      {formatTime(comment.createAt)}
                    </span>
                  </div>
                  <button
                    className={styles.moreButton}
                    title="更多選項"
                    aria-label="更多選項"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* 留言內容 */}
                <div className={styles.commentContent}>
                  {comment.content}
                </div>

                {/* 留言底部互動 */}
                <div className={styles.commentFooter}>
                  <button
                    className={`${styles.likeButton} ${
                      isLiked ? styles.liked : ''
                    }`}
                    onClick={() => handleLike(comment.id)}
                    title="按讚"
                  >
                    <Heart
                      size={16}
                      fill={isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{comment.likes}</span>
                  </button>

                  <button className={styles.replyButton} title="回覆">
                    <MessageCircle size={16} />
                    <span>回覆</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 留言框 */}
      <div className={styles.inputWrapper}>
        <form onSubmit={handleSubmit} className={styles.inputContainer}>
          <div className={styles.textareaWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="分享你的想法... (最多 500 個字)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, MAX_LENGTH))}
              disabled={isSubmitting}
              rows={3}
            />
            <div
              className={`${styles.charCount} ${
                newComment.length === MAX_LENGTH ? styles.exceeded : ''
              }`}
            >
              {newComment.length}/{MAX_LENGTH}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              發言者身份: {currentUserRole === 'parent' ? '我是家長' : '我是青少年'}
            </span>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                !newComment.trim() || isSubmitting || newComment.length === 0
              }
            >
              {isSubmitting ? '發送中...' : '發送'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}