/**
 * 驗證工具函數
 */

/**
 * 驗證電子郵件格式
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 驗證密碼強度
 * 至少 8 個字符，包含大小寫字母、數字
 */
export function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

/**
 * 驗證密碼強度等級
 * 返回: 'weak' | 'medium' | 'strong'
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 6) return 'weak';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
}

/**
 * 驗證用戶名
 * 3-20 個字符，只包含字母、數字、下劃線
 */
export function isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

/**
 * 驗證顯示名稱
 * 1-50 個字符
 */
export function isValidDisplayName(name: string): boolean {
    return name.trim().length > 0 && name.trim().length <= 50;
}

/**
 * 驗證電話號碼 (台灣)
 */
export function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(?:09\d{8}|0[2-8]\d{7,8})$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

/**
 * 驗證 URL 格式
 */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * 驗證中文字符
 */
export function containsChinese(text: string): boolean {
    const chineseRegex = /[\u4E00-\u9FA5]/g;
    return chineseRegex.test(text);
}

/**
 * 驗證文本長度
 */
export function isValidLength(text: string, min: number, max: number): boolean {
    const length = text.trim().length;
    return length >= min && length <= max;
}

/**
 * 驗證整數
 */
export function isValidInteger(value: string | number): boolean {
    return Number.isInteger(Number(value));
}

/**
 * 驗證年齡範圍
 */
export function isValidAgeRange(ageRange: string): boolean {
    const validRanges = ['13-15', '16-18', '19-25', '26-35', '36-50', '50+'];
    return validRanges.includes(ageRange);
}

/**
 * 驗證角色
 */
export function isValidRole(role: string): boolean {
    return role === 'parent' || role === 'teen';
}

/**
 * 驗證興趣列表
 */
export function isValidInterests(interests: string[]): boolean {
    return (
        Array.isArray(interests) &&
        interests.length <= 10 &&
        interests.every((interest) => isValidLength(interest, 1, 30))
    );
}

/**
 * 清理和驗證標籤
 */
export function cleanTags(tags: string[]): string[] {
    return tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0 && tag.length <= 50)
        .filter((tag, index, array) => array.indexOf(tag) === index)
        .slice(0, 10);
}

/**
 * 驗證文章標題
 */
export function isValidArticleTitle(title: string): boolean {
    return isValidLength(title, 5, 200);
}

/**
 * 驗證文章內容
 */
export function isValidArticleContent(content: string): boolean {
    return isValidLength(content, 20, 10000);
}

/**
 * 驗證留言內容
 */
export function isValidCommentContent(content: string): boolean {
    return isValidLength(content, 1, 2000);
}