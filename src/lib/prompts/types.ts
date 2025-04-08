/**
 * 提示词模板系统类型定义
 * 
 * 这个文件定义了提示词模板系统中使用的所有TypeScript接口和类型
 */

/**
 * 基础模板配置接口，所有模板配置都继承自此接口
 */
export interface PromptTemplateOptions {
  // 基础配置，所有模板共享
  language: 'zh-CN' | 'en-US';
  includeAuthorInfo: boolean;
}

/**
 * 提示词模板基础接口
 */
export interface PromptTemplate<T extends PromptTemplateOptions> {
  /**
   * 获取模板的默认配置
   */
  getDefaultOptions(): T;
  
  /**
   * 渲染提示词
   * @param text 输入文本
   * @param args 附加参数
   */
  render(text: string, ...args: any[]): string;
  
  /**
   * 更新模板配置
   * @param options 新的配置选项
   */
  updateOptions(options: Partial<T>): void;
  
  /**
   * 获取当前配置
   */
  getOptions(): T;
}

/**
 * 设计风格配置接口
 */
export interface DesignStyleOptions {
  styleName: 'minimal' | 'modern' | 'classic' | 'playful' | 'corporate';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'neutral' | 'custom';
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  includeAnimations: boolean;
  animationLevel: 'subtle' | 'moderate' | 'dynamic';
}

/**
 * 技术规范配置接口
 */
export interface TechSpecOptions {
  cssFramework: 'tailwind' | 'bootstrap' | 'pure-css';
  iconLibrary: 'fontawesome' | 'material' | 'lucide';
  includeJavaScript: boolean;
  optimizationLevel: 'basic' | 'advanced';
}

/**
 * 响应式设计配置接口
 */
export interface ResponsiveOptions {
  mobilePriority: boolean;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * 标准模板配置接口 
 */
export interface StandardTemplateOptions extends PromptTemplateOptions {
  designStyle: DesignStyleOptions;
  techSpec: TechSpecOptions;
  responsive: ResponsiveOptions;
  contentEnhancement: {
    smartFormatting: boolean;
    addDefinitions: boolean;
    visualizeData: boolean;
  };
}

/**
 * 模板管理器接口
 */
export interface TemplateManager {
  /**
   * 注册模板
   * @param name 模板名称
   * @param template 模板实例
   */
  register<T extends PromptTemplateOptions>(name: string, template: PromptTemplate<T>, isDefault?: boolean): void;
  
  /**
   * 获取模板
   * @param name 模板名称
   */
  get<T extends PromptTemplateOptions>(name: string): PromptTemplate<T> | undefined;
  
  /**
   * 根据内容和类型自动选择合适的模板
   * @param text 输入文本
   */
  autoSelect(text: string): PromptTemplate<any>;
}

/**
 * 内容类型枚举
 */
export enum ContentType {
  BLOG_POST = 'blog_post',
  PRODUCT_DESCRIPTION = 'product_description',
  TECHNICAL_DOCUMENTATION = 'technical_documentation',
  ACADEMIC_PAPER = 'academic_paper',
  PERSONAL_RESUME = 'personal_resume',
  COMPANY_INTRODUCTION = 'company_introduction',
}

/**
 * 设计风格预设类型
 */
export enum DesignStylePreset {
  MINIMAL_MODERN = 'minimal_modern',
  CORPORATE_PROFESSIONAL = 'corporate_professional',
  CREATIVE_PLAYFUL = 'creative_playful',
  ACADEMIC_FORMAL = 'academic_formal',
  TECHNICAL_DOCUMENTATION = 'technical_documentation',
}

/**
 * 预设配置提供器接口
 */
export interface PresetProvider {
  /**
   * 获取设计风格预设
   * @param preset 预设名称
   */
  getDesignStylePreset(preset: DesignStylePreset): DesignStyleOptions;
  
  /**
   * 获取针对内容类型的配置
   * @param contentType 内容类型
   */
  getContentTypeConfig(contentType: ContentType): Partial<StandardTemplateOptions>;
} 