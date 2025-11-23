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
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Comment } from '@/lib/types';
import { moderateContent } from '@/lib/ai/content-moderation';

const COMMENTS_COLLECTION = 'comments';

/**
 * 新增留言
 * @param articleId - 文章 ID
 * @param authorId - 留言者 ID
 * @param authorRole - 留言者身份（parent/teen）
 * @param content - 留言內容
 * @returns 新建立的留言
 */
export async function addComment(
  articleId: string,
  authorId: string,
  authorRole: 'parent' | 'teen',
  content: string,
  authorName: string
): Promise<Comment> {
  // 先進行內容審查
  const moderationResult = await moderateContent(content);

  if (!moderationResult.isApproved && moderationResult.severity === 'high') {
    throw new Error(
      `您的留言包含不適合的內容。${moderationResult.suggestions.join('；')}`
    );
  }

  // 準備留言資料
  const commentData = {
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

  try {
    // 新增到 Firestore
    const docRef = await addDoc(
      collection(db, COMMENTS_COLLECTION),
      commentData
    );

    // 返回完整的 Comment 對象
    return {
      id: docRef.id,
      ...commentData,
      createAt: new Date(),
      updateAt: new Date(),
    } as Comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('無法發送留言，請稍後重試');
  }
}

/**
 * 取得文章的所有留言
 * @param articleId - 文章 ID
 * @returns 留言陣列
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
      comments.push({
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

    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw new Error('無法加載留言，請稍後重試');
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

    // 返回新的按讚數
    const updatedDoc = await (
      await import('firebase/firestore')
    ).getDoc(commentRef);
    return updatedDoc.data()?.likes || 0;
  } catch (error) {
    console.error('Error liking comment:', error);
    throw new Error('無法為留言按讚');
  }
}

/**
 * 取消對留言的按讚
 * @param commentId - 留言 ID
 * @returns 更新後的按讚數
 */
export async function unlikeComment(commentId: string): Promise<number> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, {
      likes: increment(-1),
      updateAt: Timestamp.now(),
    });

    const updatedDoc = await (
      await import('firebase/firestore')
    ).getDoc(commentRef);
    return updatedDoc.data()?.likes || 0;
  } catch (error) {
    console.error('Error unliking comment:', error);
    throw new Error('無法取消按讚');
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

    // 返回更新後的留言
    const updatedDoc = await (
      await import('firebase/firestore')
    ).getDoc(commentRef);
    const data = updatedDoc.data();

    if (!data) {
      throw new Error('留言資料不存在');
    }
    return {
      id: updatedDoc.id,
      articleId: data.articleId ?? '',
      authorId: data.authorId ?? '',
      authorName: data.authorName ?? '',
      authorRole: data.authorRole ?? '',
      content: data.content ?? '',
      likes: data.likes ?? 0,
      createAt: data.createAt && typeof data.createAt.toDate === 'function'
        ? data.createAt.toDate()
        : new Date(data.createAt ?? Date.now()),
      updateAt: data.updateAt && typeof data.updateAt.toDate === 'function'
        ? data.updateAt.toDate()
        : new Date(data.updateAt ?? Date.now()),
    };
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('無法編輯留言');
  }
}

/**
 * 取得某個使用者的所有留言
 * @param userId - 使用者 ID
 * @returns 留言陣列
 */
export async function getCommentsByUser(userId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('authorId', '==', userId),
      orderBy('createAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
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

    return comments;
  } catch (error) {
    console.error('Error getting user comments:', error);
    throw new Error('無法加載使用者留言');
  }
}