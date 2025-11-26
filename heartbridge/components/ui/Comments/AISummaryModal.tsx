'use client';

import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { Comment } from '@/lib/types';
import styles from './AISummaryModal.module.css';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  isLoading?: boolean;
  onSummarize?: (comments: Comment[]) => Promise<void>;
}

interface AISummary {
  parentViewpoints: string[];
  teenViewpoints: string[];
  consensus: string[];
  conflicts: string[];
  totalComments: number;
}

/**
 * AI 統整懸浮視窗組件
 * 
 * 使用方式：
 * 1. 在頁面中引入此組件
 * 2. 管理 isOpen 狀態
 * 3. 傳入 comments 陣列
 * 4. 實現 onSummarize 方法調用 AI 統整 API
 * 
 * 示例：
 * const [showAISummary, setShowAISummary] = useState(false);
 * 
 * <AISummaryModal
 *   isOpen={showAISummary}
 *   onClose={() => setShowAISummary(false)}
 *   comments={comments}
 *   onSummarize={async (comments) => {
 *     const result = await summarizeComments(comments);
 *     setSummary(result);
 *   }}
 * />
 */
export function AISummaryModal({
  isOpen,
  onClose,
  comments,
  isLoading = false,
  onSummarize,
}: AISummaryModalProps) {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      if (onSummarize) {
        await onSummarize(comments);
        // 注意：onSummarize 應該在內部設置 summary 狀態
        // 或者這裡可以等待並獲取結果
      }
    } catch (error) {
      console.error('Error summarizing comments:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className={styles.overlay} onClick={onClose} />

      {/* 懸浮視窗 */}
      <div className={styles.modal}>
        {/* 標題欄 */}
        <div className={styles.header}>
          <h2 className={styles.title}>🤖 AI 留言統整</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="關閉"
          >
            <X size={24} />
          </button>
        </div>

        {/* 內容區域 */}
        <div className={styles.content}>
          {summaryLoading ? (
            <div className={styles.loadingState}>
              <Loader size={40} className={styles.spinner} />
              <p>正在分析留言中...</p>
            </div>
          ) : summary ? (
            <div className={styles.summaryContent}>
              {/* 統計信息 */}
              <div className={styles.statsBox}>
                <p>共分析 <strong>{summary.totalComments}</strong> 則留言</p>
              </div>

              {/* 家長觀點 */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>👨‍👩‍👧 家長觀點</h3>
                <ul className={styles.pointsList}>
                  {summary.parentViewpoints.map((point, idx) => (
                    <li key={idx} className={styles.point}>
                      {point}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 青少年觀點 */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>👦 青少年觀點</h3>
                <ul className={styles.pointsList}>
                  {summary.teenViewpoints.map((point, idx) => (
                    <li key={idx} className={styles.point}>
                      {point}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 共識點 */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>✅ 共識點</h3>
                <ul className={styles.pointsList}>
                  {summary.consensus.map((point, idx) => (
                    <li key={idx} className={styles.point}>
                      {point}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 分歧點 */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>⚠️ 分歧點</h3>
                <ul className={styles.pointsList}>
                  {summary.conflicts.map((point, idx) => (
                    <li key={idx} className={styles.point}>
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>按下按鈕開始 AI 統整</p>
            </div>
          )}
        </div>

        {/* 底部操作欄 */}
        <div className={styles.footer}>
          <button
            className={styles.summarizeButton}
            onClick={handleSummarize}
            disabled={summaryLoading}
          >
            {summaryLoading ? '統整中...' : '開始統整'}
          </button>
          <button
            className={styles.closeButtonSecondary}
            onClick={onClose}
          >
            關閉
          </button>
        </div>
      </div>
    </>
  );
}

export default AISummaryModal;