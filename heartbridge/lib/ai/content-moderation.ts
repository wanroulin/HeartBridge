import { ModerationResult } from "../types/ai";

/**
 * 內容審查功能
 * TODO: 顏實作 AI 審查邏輯
 * 
 * @param content - 要審查的文字內容
 * @returns 審查結果
 * 
 * 也可以試試 OpenAI Moderation API
 * API Key 已設定在環境變數: process.env.OPENAI_API_KEY
 */

export async function moderateContent(
    content: string
) : Promise <ModerationResult> {
    // TODO: 實作 AI 審查邏輯
    console.log('審查機制尚未實作，使用 Mock data');

    // 關鍵字檢測 (臨時)
  const offensiveWords = ['笨蛋', '白痴', '廢物', '垃圾'];
  const foundWords = offensiveWords.filter(word => content.includes(word));
  
  if (foundWords.length > 0) {
    return {
      isApproved: false,
      detectedIssues: ['攻擊性或貶低性字眼'],
      suggestions: [
        '移除攻擊性用語',
        '用描述感受的方式表達（例如：我感到很挫折）',
      ],
      severity: 'high',
    };
  }

  return {
    isApproved: true,
    detectedIssues: [],
    suggestions: [],
    severity: 'low',
  };
}