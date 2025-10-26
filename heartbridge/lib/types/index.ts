export type UserRole = 'parent' | 'teen';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    phone?: string;
    birthDate: {
        year: number;
        month: number;
        day: number;
    };
    ageRange: string;
    interest: string[];
    createAt: Date;
    updateAt: Date;
}

export interface Article {
    id: string;
    authorId: string;
    authorName: UserRole;
    title: string;
    content: string;
    tags: string[];
    likes: number;
    commentCount: number;
    createAt: Date;
    updateAt: Date;
    editHistory?: EditHistory[];
}

export interface EditHistory {
    editeAt: Date;
    previousTitle: string;
    previousContent: string;
    previousTags: string[];
}

// 留言
export interface Comment {
    id: string;
    articleId: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    content: string;
    likes: number;
    createAt: Date;
    updateAt: Date;
}

// 收藏
export interface Favorite {
    id: string;
    userId: string;
    articleId: string;
    createAt: Date;
}

// 徽章
export type BadgeType = 'empathy' | 'brave' | 'bridge|builder';

export interface Badge {
    id: BadgeType;
    name: string;
    description: string;
    icon: string;
    requirement: string;
}

export interface UserBadge {
    userId: string;
    badgeId: BadgeType;
    earnedAt: Date;
}

// 主題
export type ThemeType = 'neutral' | 'parent' | 'teen';