import { Comment } from "../types";
import { CommentSummary } from "../types/ai";

export async function summarizeComments(
    comments: Comment[]
) : Promise <CommentSummary> {
    // TODO: 實作 AI 統整邏輯

    // 暫時 mock data
    console.log('summarizeComments 尚未實作，使用 mock data');
    console.log(`收到 ${comments.length} 則留言待統整`);

    // 分類留言(臨時)
    const parentComments = comments.filter(c => c.authorRole === 'parent');
    const teenComments = comments.filter(c => c.authorRole === 'teen');

    return {
        parentViewpoints: [
            '家長們關心孩子的學業和未來發展',
            '希望能建立明確的規則和界限',
            '擔心過度使用會影響身心健康',
        ],

        teenViewpoints: [
            '青少年認為這是重要的社交方式',
            '希望家長能理解和尊重自己的選擇',
            '願意在合理範圍內溝通和妥協',
        ],

        consensus: [
            '雙方都認同需要溝通而非單方面命令',
            '都希望找到平衡點',
        ],

        conflicts: [
            '對於「適度」的定義有不同看法',
            '時間分配的優先順序有差異',
        ],

        totalComments: comments.length,
    };
}