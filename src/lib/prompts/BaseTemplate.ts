import { PromptTemplate, PromptTemplateOptions } from './types';

/**
 * 基础模板抽象类
 * 
 * 这个类提供了所有提示词模板的基础功能，包括配置管理和模板渲染
 */
export abstract class BaseTemplate<T extends PromptTemplateOptions> implements PromptTemplate<T> {
  /**
   * 模板配置
   */
  protected options: T;
  
  /**
   * 默认配置
   */
  protected defaultOptions: T;

  /**
   * 构造函数
   * @param options 可选的配置选项
   */
  constructor(options?: Partial<T>) {
    this.defaultOptions = this.getDefaultOptions();
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * 获取模板的默认配置（由子类实现）
   */
  abstract getDefaultOptions(): T;
  
  /**
   * 渲染提示词（由子类实现）
   * @param text 输入文本
   * @param args 附加参数
   */
  abstract render(text: string, ...args: any[]): string;
  
  /**
   * 更新模板配置
   * @param options 新的配置选项
   */
  updateOptions(options: Partial<T>): void {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * 获取当前配置
   */
  getOptions(): T {
    return { ...this.options };
  }
  
  /**
   * 提供通用的模板插值功能
   * @param template 模板字符串
   * @param data 数据对象
   * @returns 替换后的字符串
   */
  protected interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (data.hasOwnProperty(key)) {
        return data[key];
      }
      return match; // 保留未匹配的占位符
    });
  }
  
  /**
   * 根据条件添加模板部分
   * @param condition 条件
   * @param templatePart 条件为真时要添加的模板部分
   * @returns 条件为真时返回模板部分，否则返回空字符串
   */
  protected conditionalPart(condition: boolean, templatePart: string): string {
    return condition ? templatePart : '';
  }
  
  /**
   * 从对象生成文本描述
   * @param obj 对象
   * @returns 文本描述
   */
  protected objectToText(obj: any, indent: number = 0): string {
    if (!obj) return '';
    
    const indentStr = ' '.repeat(indent);
    let text = '';
    
    for (const [key, value] of Object.entries(obj)) {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      
      if (typeof value === 'object' && value !== null) {
        text += `${indentStr}- ${formattedKey}:\n`;
        text += this.objectToText(value, indent + 2);
      } else {
        text += `${indentStr}- ${formattedKey}: ${value}\n`;
      }
    }
    
    return text;
  }
} 