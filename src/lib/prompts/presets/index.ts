import { ContentType, DesignStyleOptions, DesignStylePreset, PresetProvider, StandardTemplateOptions } from '../types';
import { contentTypePresets } from './contentTypes';
import { designStylePresets } from './designStyles';

/**
 * 预设提供器
 * 
 * 提供访问各种预设配置的方法
 */
export class PresetProviderImpl implements PresetProvider {
  /**
   * 获取设计风格预设
   * @param preset 预设名称
   */
  getDesignStylePreset(preset: DesignStylePreset): DesignStyleOptions {
    return { ...designStylePresets[preset] };
  }
  
  /**
   * 获取针对内容类型的配置
   * @param contentType 内容类型
   */
  getContentTypeConfig(contentType: ContentType): Partial<StandardTemplateOptions> {
    return { ...contentTypePresets[contentType] };
  }
  
  /**
   * 获取所有设计风格预设的名称
   */
  getAllDesignStylePresets(): DesignStylePreset[] {
    return Object.values(DesignStylePreset);
  }
  
  /**
   * 获取所有内容类型的名称
   */
  getAllContentTypes(): ContentType[] {
    return Object.values(ContentType);
  }
  
  /**
   * 根据文本内容检测可能的内容类型
   * @param text 文本内容
   */
  detectContentType(text: string): ContentType {
    // 使用简单的关键词匹配来检测内容类型
    const contentPatterns: Record<ContentType, RegExp[]> = {
      [ContentType.BLOG_POST]: [
        /blog/i,
        /文章/,
        /post/i,
        /日记/,
        /diary/i,
      ],
      [ContentType.PRODUCT_DESCRIPTION]: [
        /产品/,
        /product/i,
        /feature/i,
        /功能/,
        /价格/,
        /price/i,
        /规格/,
        /specification/i,
      ],
      [ContentType.TECHNICAL_DOCUMENTATION]: [
        /技术/,
        /technical/i,
        /documentation/i,
        /文档/,
        /API/i,
        /接口/,
        /代码/,
        /code/i,
      ],
      [ContentType.ACADEMIC_PAPER]: [
        /学术/,
        /academic/i,
        /论文/,
        /paper/i,
        /研究/,
        /research/i,
        /引用/,
        /citation/i,
      ],
      [ContentType.PERSONAL_RESUME]: [
        /简历/,
        /resume/i,
        /CV/i,
        /经历/,
        /experience/i,
        /技能/,
        /skill/i,
        /教育/,
        /education/i,
      ],
      [ContentType.COMPANY_INTRODUCTION]: [
        /公司/,
        /company/i,
        /企业/,
        /business/i,
        /团队/,
        /team/i,
        /关于我们/,
        /about us/i,
      ],
    };
    
    // 计算每种类型的匹配分数
    const scores = Object.entries(contentPatterns).map(([type, patterns]) => {
      const score = patterns.reduce((sum, pattern) => {
        return sum + (pattern.test(text) ? 1 : 0);
      }, 0);
      return { type: type as ContentType, score };
    });
    
    // 返回得分最高的类型
    scores.sort((a, b) => b.score - a.score);
    return scores[0].score > 0 ? scores[0].type : ContentType.BLOG_POST; // 默认为博客类型
  }
}

/**
 * 创建全局预设提供器实例
 */
export const presetProvider = new PresetProviderImpl();

// 导出所有预设
export * from './designStyles';
export * from './contentTypes'; 