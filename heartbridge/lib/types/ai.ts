// AI 內容審查結果
export interface ModerationResult {
    isApproved: boolean;
    detectedIssues: string[];
    suggestions: string[];
    severity: 'low' | 'medium' | 'high';
}

// AI 留言統整結果
export interface CommentSummary {
    parentViewpoints: string[];
    teenViewpoints: string[];
    consensus: string[];
    conflicts: string[];
    totalComments: number;
}