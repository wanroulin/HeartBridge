import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const USERS_COLLECTION = 'users';
const ARTICLES_COLLECTION = 'articles';

/**
 * 確保用戶文檔存在並有 savedArticles 欄位
 */
async function ensureUserDocExists(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('Creating minimal user doc for:', userId);
      await setDoc(userRef, {
        savedArticles: [],
        updateAt: serverTimestamp(),
      }, { merge: true });
    } else if (!userDoc.data()?.savedArticles) {
      console.log('Adding savedArticles field to user doc:', userId);
      await updateDoc(userRef, {
        savedArticles: [],
        updateAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error ensuring user doc exists:', error);
    throw error;
  }
}

/**
 * 收藏文章
 */
export async function saveArticle(userId: string, articleId: string): Promise<boolean> {
  try {
    console.log('[saveArticle] 開始保存文章:', { userId, articleId });
    
    // 確保用戶文檔存在
    await ensureUserDocExists(userId);
    
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // 更新用戶文檔
    await updateDoc(userRef, {
      savedArticles: arrayUnion(articleId),
      updateAt: serverTimestamp(),
    });
    
    console.log('[saveArticle] ✅ 保存成功:', articleId);
    return true;
  } catch (error) {
    console.error('[saveArticle] ❌ 保存失敗:', error);
    throw new Error('無法收藏文章，請稍後重試');
  }
}

/**
 * 取消收藏文章
 */
export async function unsaveArticle(userId: string, articleId: string): Promise<boolean> {
  try {
    console.log('[unsaveArticle] 開始取消收藏:', { userId, articleId });
    
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // 從 savedArticles 陣列中移除
    await updateDoc(userRef, {
      savedArticles: arrayRemove(articleId),
      updateAt: serverTimestamp(),
    });
    
    console.log('[unsaveArticle] ✅ 取消成功:', articleId);
    return true;
  } catch (error) {
    console.error('[unsaveArticle] ❌ 取消失敗:', error);
    throw new Error('無法取消收藏，請稍後重試');
  }
}

/**
 * 檢查用戶是否已收藏該文章
 */
export async function isArticleSaved(userId: string, articleId: string): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('[isArticleSaved] 用戶文檔不存在:', userId);
      return false;
    }
    
    const savedArticles = userDoc.data()?.savedArticles || [];
    const isSaved = savedArticles.includes(articleId);
    
    console.log('[isArticleSaved]', { userId, articleId, isSaved, total: savedArticles.length });
    return isSaved;
  } catch (error) {
    console.error('[isArticleSaved] ❌ 查詢失敗:', error);
    return false;
  }
}

/**
 * 獲取用戶的所有已收藏文章 ID
 */
export async function getSavedArticleIds(userId: string): Promise<string[]> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('[getSavedArticleIds] 用戶文檔不存在:', userId);
      return [];
    }
    
    const savedArticles = userDoc.data()?.savedArticles || [];
    console.log('[getSavedArticleIds]', { userId, count: savedArticles.length, ids: savedArticles });
    
    return savedArticles;
  } catch (error) {
    console.error('[getSavedArticleIds] ❌ 查詢失敗:', error);
    return [];
  }
}

/**
 * 獲取用戶的已收藏文章詳情
 * 方式：逐個查詢文章，避免複雜的 Firestore 查詢
 */
export async function getSavedArticles(userId: string): Promise<any[]> {
  try {
    console.log('[getSavedArticles] 開始查詢用戶收藏:', userId);
    
    // 1. 獲取收藏 ID 列表
    const savedIds = await getSavedArticleIds(userId);
    
    if (savedIds.length === 0) {
      console.log('[getSavedArticles] 用戶沒有收藏');
      return [];
    }
    
    console.log('[getSavedArticles] 找到', savedIds.length, '篇收藏');
    
    // 2. 逐個查詢文章詳情
    const articles: any[] = [];
    
    for (const articleId of savedIds) {
      try {
        const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
        const articleDoc = await getDoc(articleRef);
        
        if (articleDoc.exists()) {
          const data = articleDoc.data();
          
          // 轉換時間戳
          const createAt = data.createAt?.toDate?.() || new Date(data.createAt);
          const updateAt = data.updateAt?.toDate?.() || new Date(data.updateAt);
          
          articles.push({
            id: articleDoc.id,
            ...data,
            createAt,
            updateAt,
          });
          
          console.log('[getSavedArticles] ✓ 成功加載:', articleId);
        } else {
          console.warn('[getSavedArticles] ⚠ 文章已刪除:', articleId);
        }
      } catch (err) {
        console.error('[getSavedArticles] ✗ 加載失敗:', articleId, err);
        // 繼續加載其他文章
      }
    }
    
    console.log('[getSavedArticles] ✅ 完成，共', articles.length, '篇');
    return articles;
  } catch (error) {
    console.error('[getSavedArticles] ❌ 查詢失敗:', error);
    return [];
  }
}