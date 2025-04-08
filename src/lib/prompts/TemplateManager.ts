import { PromptTemplate, PromptTemplateOptions, TemplateManager as ITemplateManager } from './types';

/**
 * 模板管理器
 * 
 * 负责管理所有提示词模板，提供注册、获取和选择模板的功能
 */
export class TemplateManager implements ITemplateManager {
  /**
   * 存储所有注册的模板
   */
  private templates: Map<string, PromptTemplate<any>> = new Map();
  
  /**
   * 默认模板名称
   */
  private defaultTemplateName: string | null = null;
  
  /**
   * 内容类型检测正则表达式集合
   */
  private contentTypePatterns: Array<{
    type: string;
    pattern: RegExp;
    template: string;
  }> = [];

  /**
   * 注册模板
   * @param name 模板名称
   * @param template 模板实例
   * @param isDefault 是否设为默认模板
   */
  register<T extends PromptTemplateOptions>(
    name: string, 
    template: PromptTemplate<T>, 
    isDefault: boolean = false
  ): void {
    this.templates.set(name, template);
    
    if (isDefault) {
      this.defaultTemplateName = name;
    }
  }
  
  /**
   * 获取模板
   * @param name 模板名称
   */
  get<T extends PromptTemplateOptions>(name: string): PromptTemplate<T> | undefined {
    return this.templates.get(name) as PromptTemplate<T> | undefined;
  }
  
  /**
   * 根据内容和类型自动选择合适的模板
   * @param text 输入文本
   */
  autoSelect(text: string): PromptTemplate<any> {    
    // 基于文本内容类型检测合适的模板
    for (const { pattern, template } of this.contentTypePatterns) {
      if (pattern.test(text)) {
        const matchedTemplate = this.templates.get(template);
        if (matchedTemplate) return matchedTemplate;
      }
    }
    
    // 如果没有匹配的内容类型，使用默认模板
    if (this.defaultTemplateName) {
      const template = this.templates.get(this.defaultTemplateName);
      if (template) return template;
    }
    
    // 如果没有设置默认模板，使用第一个注册的模板
    const firstTemplate = this.templates.values().next().value;
    if (firstTemplate) return firstTemplate;
    
    // 如果没有任何模板，抛出错误
    throw new Error('No templates registered in TemplateManager');
  }
  
  /**
   * 注册内容类型检测模式
   * @param type 内容类型标识
   * @param pattern 检测正则表达式
   * @param templateName 对应的模板名称
   */
  registerContentTypePattern(type: string, pattern: RegExp, templateName: string): void {
    this.contentTypePatterns.push({
      type,
      pattern,
      template: templateName
    });
  }
  
  /**
   * 获取所有已注册的模板名称
   */
  getTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }
  
  /**
   * 获取默认模板
   */
  getDefaultTemplate(): PromptTemplate<any> | undefined {
    if (!this.defaultTemplateName) return undefined;
    return this.templates.get(this.defaultTemplateName);
  }
  
  /**
   * 设置默认模板
   * @param name 模板名称
   */
  setDefaultTemplate(name: string): void {
    if (!this.templates.has(name)) {
      throw new Error(`Template with name '${name}' not registered`);
    }
    this.defaultTemplateName = name;
  }
}

/**
 * 创建全局模板管理器实例
 */
export const templateManager = new TemplateManager(); 