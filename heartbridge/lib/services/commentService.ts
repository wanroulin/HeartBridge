import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  increment,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Comment } from '@/lib/types';
import { moderateContent } from '@/lib/ai/content-moderation';

const COMMENTS_COLLECTION = 'comments';

/**
 * 新增留言 - 支持回覆
 * @param articleId - 文章 ID
 * @param authorId - 留言者 ID
 * @param authorRole - 留言者身份（parent/teen）
 * @param content - 留言內容
 * @param authorName - 留言者名稱
 * @param parentCommentId - 回覆的父留言 ID（可選）
 * @returns 新建立的留言
 */
export async function addComment(
  articleId: string,
  authorId: string,
  authorRole: 'parent' | 'teen',
  content: string,
  authorName: string,
  parentCommentId?: string
): Promise<Comment> {
  // 先進行內容審查
  const moderationResult = await moderateContent(content);

  if (!moderationResult.isApproved && moderationResult.severity === 'high') {
    throw new Error(
      `您的留言包含不適合的內容。${moderationResult.suggestions.join('；')}`
    );
  }

  // 準備留言資料
  const commentData: any = {
    articleId,
    authorId,
    authorName,
    authorRole,
    content,
    likes: 0,
    createAt: Timestamp.now(),
    updateAt: Timestamp.now(),
    moderated: !moderationResult.isApproved,
  };

  // 🔑 如果是回覆，添加 parentCommentId
  if (parentCommentId) {
    commentData.parentCommentId = parentCommentId;
    console.log(`[addComment] 添加回覆到 ${parentCommentId}`);
  }

  try {
    // 新增到 Firestore
    const docRef = await addDoc(
      collection(db, COMMENTS_COLLECTION),
      commentData
    );

    // 返回完整的 Comment 對象
    const newComment: Comment = {
      id: docRef.id,
      ...commentData,
      createAt: new Date(),
      updateAt: new Date(),
    };

    console.log('[addComment] ✅ 留言已保存:', newComment);
    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('無法發送留言，請稍後重試');
  }
}

/**
 * 取得文章的所有留言（包括回覆）
 * @param articleId - 文章 ID
 * @returns 留言陣列（已組織成樹狀結構）
 */
export async function getCommentsByArticle(articleId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('articleId', '==', articleId),
      orderBy('createAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const comment: Comment = {
        id: doc.id,
        articleId: data.articleId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorRole: data.authorRole,
        content: data.content,
        likes: data.likes,
        createAt: data.createAt && typeof data.createAt.toDate === 'function'
          ? data.createAt.toDate()
          : new Date(data.createAt),
        updateAt: data.updateAt && typeof data.updateAt.toDate === 'function'
          ? data.updateAt.toDate()
          : new Date(data.updateAt),
      };

      // 🔑 如果有 parentCommentId，將其包含在返回的 Comment 中
      if (data.parentCommentId) {
        (comment as any).parentCommentId = data.parentCommentId;
      }

      comments.push(comment);
    });

    console.log(`[getCommentsByArticle] ✅ 獲取 ${comments.length} 則留言`);
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw new Error('無法加載留言，請稍後重試');
  }
}

/**
 * 取得某個留言的所有回覆
 * @param parentCommentId - 父留言 ID
 * @returns 回覆陣列
 */
export async function getRepliesByComment(parentCommentId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('parentCommentId', '==', parentCommentId),
      orderBy('createAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const replies: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      replies.push({
        id: doc.id,
        articleId: data.articleId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorRole: data.authorRole,
        content: data.content,
        likes: data.likes,
        createAt: data.createAt && typeof data.createAt.toDate === 'function'
          ? data.createAt.toDate()
          : new Date(data.createAt),
        updateAt: data.updateAt && typeof data.updateAt.toDate === 'function'
          ? data.updateAt.toDate()
          : new Date(data.updateAt),
      });
    });

    console.log(`[getRepliesByComment] ✅ 獲取 ${replies.length} 則回覆`);
    return replies;
  } catch (error) {
    console.error('Error getting replies:', error);
    throw new Error('無法加載回覆，請稍後重試');
  }
}

/**
 * 對留言按讚
 * @param commentId - 留言 ID
 * @returns 更新後的按讚數
 */
export async function likeComment(commentId: string): Promise<number> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, {
      likes: increment(1),
      updateAt: Timestamp.now(),
    });

    const updatedDoc = await getDoc(commentRef);
    return updatedDoc.data()?.likes || 0;
  } catch (error) {
    console.error('Error liking comment:', error);
    throw new Error('無法為留言按讚');
  }
}

/**
 * 刪除留言
 * @param commentId - 留言 ID
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await (await import('firebase/firestore')).deleteDoc(commentRef);
    console.log(`[deleteComment] ✅ 留言已刪除: ${commentId}`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('無法刪除留言');
  }
}

/**
 * 編輯留言
 * @param commentId - 留言 ID
 * @param content - 新的內容
 * @returns 更新後的留言
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<Comment> {
  // 先進行內容審查
  const moderationResult = await moderateContent(content);

  if (!moderationResult.isApproved && moderationResult.severity === 'high') {
    throw new Error(
      `您的留言包含不適合的內容。${moderationResult.suggestions.join('；')}`
    );
  }

  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, {
      content,
      updateAt: Timestamp.now(),
      moderated: !moderationResult.isApproved,
    });

    const updatedDoc = await getDoc(commentRef);
    const data = updatedDoc.data();

    if (!data) {
      throw new Error('留言資料不存在');
    }

    const updatedComment: Comment = {
      id: updatedDoc.id,
      articleId: data.articleId ?? '',
      authorId: data.authorId ?? '',
      authorName: data.authorName ?? '',
      authorRole: data.authorRole ?? '',
      content: data.content ?? '',
      likes: data.likes ?? 0,
      createAt: data.createAt && typeof data.createAt.toDate === 'function'
        ? data.createAt.toDate()
        : new Date(data.createAt),
      updateAt: data.updateAt && typeof data.updateAt.toDate === 'function'
        ? data.updateAt.toDate()
        : new Date(data.updateAt),
    };

    if (data.parentCommentId) {
      (updatedComment as any).parentCommentId = data.parentCommentId;
    }

    console.log(`[updateComment] ✅ 留言已更新: ${commentId}`);
    return updatedComment;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('無法編輯留言');
  }
}