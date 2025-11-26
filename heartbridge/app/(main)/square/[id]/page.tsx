'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import styles from './page.module.css';
import { Comment, UserRole } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { AISummaryModal } from '@/components/ui/Comments/AISummaryModal';

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
  currentUserRole: UserRole;
  onSubmitComment: (content: string, parentCommentId?: string) => Promise<void>;
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showAISummary, setShowAISummary] = useState(false);
  const MAX_LENGTH = 500;
  const MAX_REPLY_LENGTH = 300;

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

  const handleSubmitReply = async (e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    try {
      await onSubmitComment(replyText, parentCommentId);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
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
      return { text: '我是家長', className: `${styles.authorBadge} ${styles.parent}` };
    } else {
      return { text: '我是青少年', className: `${styles.authorBadge} ${styles.teen}` };
    }
  };

  // 建立嵌套結構：將回覆組織到主留言下方
  const buildCommentTree = (allComments: Comment[]): CommentWithReplies[] => {
    const commentMap = new Map<string, CommentWithReplies>();
    const roots: CommentWithReplies[] = [];

    // 首先創建所有留言的映射
    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // 然後組織層級關係
    allComments.forEach((comment) => {
      const commentNode = commentMap.get(comment.id)!;
      
      if ((comment as any).parentCommentId) {
        // 這是一個回覆
        const parentNode = commentMap.get((comment as any).parentCommentId);
        if (parentNode) {
          parentNode.replies!.push(commentNode);
        }
      } else {
        // 這是主留言
        roots.push(commentNode);
      }
    });

    return roots;
  };

  // 渲染單個評論
  const renderComment = (comment: CommentWithReplies, isReply = false) => {
    const badge = getRoleBadge(comment.authorRole);
    const isLiked = likedComments.has(comment.id);

    return (
      <div key={comment.id} className={isReply ? styles.replyComment : styles.comment}>
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

          {/* 回覆按鈕 - 只在非回覆留言時顯示 */}
          {!isReply && (
            <button 
              className={styles.replyButton} 
              title="回覆"
              onClick={() => setReplyingTo(comment.id)}
            >
              <MessageCircle size={16} />
              <span>回覆</span>
            </button>
          )}
        </div>

        {/* 回覆輸入框 */}
        {replyingTo === comment.id && (
          <div className={styles.replyInputWrapper}>
            <form onSubmit={(e) => handleSubmitReply(e, comment.id)}>
              <textarea
                className={styles.replyTextarea}
                placeholder={`回覆 ${comment.authorName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, MAX_REPLY_LENGTH))}
                disabled={isSubmitting}
                rows={2}
                autoFocus
              />
              <div className={styles.replyActions}>
                <span className={styles.charCount}>
                  {replyText.length}/{MAX_REPLY_LENGTH}
                </span>
                <div className={styles.replyButtons}>
                  <button
                    type="submit"
                    className={styles.submitReplyButton}
                    disabled={!replyText.trim() || isSubmitting}
                  >
                    送出
                  </button>
                  <button
                    type="button"
                    className={styles.cancelReplyButton}
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* 回覆列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className={styles.replies}>
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  const commentTree = buildCommentTree(comments);

  return (
    <>
      <div className={styles.container}>
        {/* 留言區標題 + AI 統整按鈕 */}
        <div className={styles.commentsHeader}>
          <h2 className={styles.commentsTitle}>留言 ({comments.length})</h2>
          <button 
            className={styles.aiSummaryButton}
            onClick={() => setShowAISummary(true)}
            title="AI統整留言"
          >
            🤖 AI 統整
          </button>
        </div>

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
            commentTree.map((comment) => renderComment(comment))
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
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? '發佈中...' : '發佈留言'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI 統整視窗 */}
      <AISummaryModal
        isOpen={showAISummary}
        onClose={() => setShowAISummary(false)}
        comments={comments}
      />
    </>
  );
}