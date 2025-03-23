import { ContentType, StandardTemplateOptions } from '../types';
import { designStylePresets } from './designStyles';

/**
 * 内容类型预设配置
 * 
 * 提供针对不同内容类型的配置预设
 */
export const contentTypePresets: Record<ContentType, Partial<StandardTemplateOptions>> = {
  /**
   * 博客文章类型
   * 
   * 适合博客类内容的配置
   */
  [ContentType.BLOG_POST]: {
    designStyle: designStylePresets.minimal_modern,
    contentEnhancement: {
      smartFormatting: true,
      addDefinitions: false,
      visualizeData: true,
    },
  },
  
  /**
   * 产品说明类型
   * 
   * 适合产品介绍和说明的配置
   */
  [ContentType.PRODUCT_DESCRIPTION]: {
    designStyle: designStylePresets.corporate_professional,
    contentEnhancement: {
      smartFormatting: true,
      addDefinitions: true,
      visualizeData: true,
    },
    techSpec: {
      cssFramework: 'tailwind',
      iconLibrary: 'lucide',
      includeJavaScript: true,
      optimizationLevel: 'advanced',
    },
  },
  
  /**
   * 技术文档类型
   * 
   * 适合技术文档和API说明的配置
   */
  [ContentType.TECHNICAL_DOCUMENTATION]: {
    designStyle: designStylePresets.technical_documentation,
    contentEnhancement: {
      smartFormatting: true,
      addDefinitions: true,
      visualizeData: true,
    },
    techSpec: {
      cssFramework: 'tailwind',
      iconLibrary: 'lucide',
      includeJavaScript: true,
      optimizationLevel: 'basic',
    },
  },
  
  /**
   * 学术论文类型
   * 
   * 适合学术内容的配置
   */
  [ContentType.ACADEMIC_PAPER]: {
    designStyle: designStylePresets.academic_formal,
    contentEnhancement: {
      smartFormatting: true,
      addDefinitions: true,
      visualizeData: true,
    },
    techSpec: {
      cssFramework: 'tailwind',
      iconLibrary: 'lucide',
      includeJavaScript: false,
      optimizationLevel: 'basic',
    },
  },
  
  /**
   * 个人简历类型
   * 
   * 适合个人简历和介绍的配置
   */
  [ContentType.PERSONAL_RESUME]: {
    designStyle: designStylePresets.minimal_modern,
    contentEnhancement: {
      smartFormatting: true,
      addDefinitions: false,
      visualizeData: true,
    },
    techSpec: {
      cssFramework: 'tailwind',
      iconLibrary: 'lucide',
      includeJavaScript: true,
      optimizationLevel: 'basic',
    },
  },
  
  /**
   * 企业介绍类型
   * 
   * 适合企业介绍和宣传的配置
   */
  [ContentType.COMPANY_INTRODUCTION]: {
    designStyle: designStylePresets.corporate_professional,
    contentEnhancement: {
      smartFormatting: true,
      addDefinitions: false,
      visualizeData: true,
    },
    techSpec: {
      cssFramework: 'tailwind',
      iconLibrary: 'lucide',
      includeJavaScript: true,
      optimizationLevel: 'advanced',
    },
  },
}; 