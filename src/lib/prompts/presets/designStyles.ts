import { DesignStyleOptions, DesignStylePreset } from '../types';

/**
 * 设计风格预设
 * 
 * 提供不同风格的设计预设配置
 */
export const designStylePresets: Record<DesignStylePreset, DesignStyleOptions> = {
  /**
   * 简约现代风格
   * 
   * 类似Linear App的清爽设计，注重留白和内容展示
   */
  [DesignStylePreset.MINIMAL_MODERN]: {
    styleName: 'minimal',
    colorScheme: 'blue',
    includeAnimations: true,
    animationLevel: 'subtle',
  },
  
  /**
   * 企业专业风格
   * 
   * 适合商业网站的专业设计，注重信息传达和专业形象
   */
  [DesignStylePreset.CORPORATE_PROFESSIONAL]: {
    styleName: 'corporate',
    colorScheme: 'blue',
    includeAnimations: true,
    animationLevel: 'subtle',
  },
  
  /**
   * 创意活泼风格
   * 
   * 适合创意内容的活泼设计，使用鲜艳的色彩和创意元素
   */
  [DesignStylePreset.CREATIVE_PLAYFUL]: {
    styleName: 'playful',
    colorScheme: 'purple',
    includeAnimations: true,
    animationLevel: 'dynamic',
  },
  
  /**
   * 学术严谨风格
   * 
   * 适合学术内容的严谨设计，注重可读性和内容表达
   */
  [DesignStylePreset.ACADEMIC_FORMAL]: {
    styleName: 'classic',
    colorScheme: 'neutral',
    includeAnimations: false,
    animationLevel: 'subtle',
  },
  
  /**
   * 技术文档风格
   * 
   * 适合技术文档的清晰设计，注重结构和内容组织
   */
  [DesignStylePreset.TECHNICAL_DOCUMENTATION]: {
    styleName: 'minimal',
    colorScheme: 'neutral',
    includeAnimations: true,
    animationLevel: 'subtle',
  },
}; 