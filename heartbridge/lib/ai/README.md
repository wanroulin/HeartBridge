# AI 功能整合文件

## 概述
@lib/ai 包含 AI 功能的介面定義，由顏誠穎實作。

## 功能清單

### 1. 內容審查 (Content Moderation)
**檔案**: `content-moderation.ts`

**功能說明**:
- 偵測文章或留言中的攻擊性、貶低性字眼
- 提供改善建議
- 判斷嚴重程度

**介面**:
```typescript
moderateContent(content: string): Promise<ModerationResult>
```

---

### 2. 留言統整 (Comment Summary)
**檔案**: `comment-summary.ts`

**功能說明**:
- 分析留言區的討論內容
- 分別整理家長和青少年的觀點
- 找出共識與分歧點
- 以列點方式呈現

**介面**:
```typescript
summarizeComments(comments: Comment[]): Promise<CommentSummary>
```

---

## 環境變數

在 `.env.local` 設定:
```env
OPENAI_API_KEY=your_api_key_here
```

---

## 測試方式

### 測試內容審查:
```typescript
import { moderateContent } from '@/lib/ai/content-moderation';

const result = await moderateContent('測試內容');
console.log(result);
```

### 測試留言統整:
```typescript
import { summarizeComments } from '@/lib/ai/comment-summary';

const comments = [
  { authorRole: 'parent', content: '...' },
  { authorRole: 'teen', content: '...' },
];

const summary = await summarizeComments(comments);
console.log(summary);
```