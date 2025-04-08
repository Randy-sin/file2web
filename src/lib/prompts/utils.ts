/**
 * 安全地解析JSON字符串，如果解析失败则返回null
 * @param jsonString JSON字符串
 * @returns 解析后的对象或null
 */
export function safeParseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON解析失败:', error);
    return null;
  }
}

/**
 * 从文本中提取并解析JSON
 * @param text 包含JSON的文本
 * @returns 解析后的JSON对象或null
 */
export function extractAndParseJSON(text: string): any {
  try {
    // 尝试直接解析整个文本
    return safeParseJSON(text);
  } catch (error) {
    // 如果直接解析失败，尝试查找JSON块
    try {
      // 尝试查找markdown格式的JSON代码块
      const jsonRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/;
      const match = text.match(jsonRegex);
      
      if (match && match[1]) {
        return safeParseJSON(match[1]);
      }
      
      // 查找看起来像JSON的内容（以{开始，以}结束）
      const jsonBlockRegex = /(\{[\s\S]*\})/;
      const blockMatch = text.match(jsonBlockRegex);
      
      if (blockMatch && blockMatch[1]) {
        return safeParseJSON(blockMatch[1]);
      }
      
      return null;
    } catch (error) {
      console.error('无法提取或解析JSON:', error);
      return null;
    }
  }
} 