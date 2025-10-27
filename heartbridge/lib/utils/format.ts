/**
 * 格式化工具函數
 */

/**
 * 截斷文本到指定長度
 */
export function truncate(text: string, length: number = 100, suffix: string = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
}

/**
 * 轉換首字母大寫
 */
export function capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * 轉換為全大寫
 */
export function toUpperCase(text: string): string {
    return text.toUpperCase();
}

/**
 * 轉換為全小寫
 */
export function toLowerCase(text: string): string {
    return text.toLowerCase();
}

/**
 * 駝峰命名轉換為蛇形命名
 */
export function camelToSnake(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * 蛇形命名轉換為駝峰命名
 */
export function snakeToCamel(snakeCase: string): string {
    return snakeCase.replace(/_[a-z]/g, (letter) => letter.toUpperCase().replace('_', ''));
}

/**
 * 格式化數字為帶千位分隔符
 */
export function formatNumber(num: number): string {
    return num.toLocaleString('zh-TW');
}

/**
 * 格式化大數字為簡潔形式
 */
export function formatCompactNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * 格式化位元組為可讀大小
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
}

/**
 * 移除 HTML 標籤
 */
export function stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

/**
 * 轉義 HTML 特殊字符
 */
export function escapeHTML(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * 高亮搜尋關鍵字
 */
export function highlightKeyword(text: string, keyword: string): string {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 格式化角色顯示名稱
 */
export function formatRoleName(role: 'parent' | 'teen'): string {
    return role === 'parent' ? '家長' : '青少年';
}

/**
 * 格式化年齡範圍顯示
 */
export function formatAgeRange(ageRange: string): string {
    const ageRangeMap: Record<string, string> = {
        '13-15': '13-15 歲',
        '16-18': '16-18 歲',
        '19-25': '19-25 歲',
        '26-35': '26-35 歲',
        '36-50': '36-50 歲',
        '50+': '50 歲以上',
    };
    return ageRangeMap[ageRange] || ageRange;
}

/**
 * 格式化嚴重程度級別
 */
export function formatSeverityLevel(severity: 'low' | 'medium' | 'high'): string {
    const severityMap = {
        low: '低',
        medium: '中',
        high: '高',
    };
    return severityMap[severity] || severity;
}

/**
 * 生成首字母頭像背景色
 */
export function getAvatarColor(name: string): string {
    const colors = [
        '#8B7D9E',
        '#5B7A92',
        '#A88968',
        '#4CAF50',
        '#2196F3',
        '#FF9800',
        '#E91E63',
        '#009688',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

/**
 * 生成首字母
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
}

/**
 * 替換敏感詞彙
 */
export function censorSensitiveWords(text: string, sensitiveWords: string[], replacement: string = '***'): string {
    let result = text;
    sensitiveWords.forEach((word) => {
        const regex = new RegExp(word, 'gi');
        result = result.replace(regex, replacement);
    });
    return result;
}

/**
 * 轉換換行符號為 <br> 標籤
 */
export function convertNewlinesToBr(text: string): string {
    return text.replace(/\n/g, '<br />');
}

/**
 * 提取文本中的 URL
 */
export function extractURLs(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.match(urlRegex) || [];
}

/**
 * 提取文本中的提及用戶 (@username)
 */
export function extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]);
    }
    return mentions;
}

/**
 * 提取文本中的主題標籤 (#hashtag)
 */
export function extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const hashtags: string[] = [];
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
        hashtags.push(match[1]);
    }
    return hashtags;
}