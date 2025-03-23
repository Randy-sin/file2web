import { BaseTemplate } from '../BaseTemplate';
import { DesignStyleOptions, ResponsiveOptions, StandardTemplateOptions, TechSpecOptions } from '../types';

/**
 * 标准模式提示词模板
 * 
 * 用于生成单页面网站的提示词模板
 */
export class StandardTemplate extends BaseTemplate<StandardTemplateOptions> {
  /**
   * 获取默认配置
   */
  getDefaultOptions(): StandardTemplateOptions {
    return {
      language: 'zh-CN',
      includeAuthorInfo: true,
      designStyle: this.getDefaultDesignStyle(),
      techSpec: this.getDefaultTechSpec(),
      responsive: this.getDefaultResponsive(),
      contentEnhancement: {
        smartFormatting: true,
        addDefinitions: false,
        visualizeData: true,
      }
    };
  }
  
  /**
   * 获取默认设计风格配置
   */
  private getDefaultDesignStyle(): DesignStyleOptions {
    return {
      styleName: 'minimal',
      colorScheme: 'blue',
      includeAnimations: true,
      animationLevel: 'subtle',
    };
  }
  
  /**
   * 获取默认技术规范配置
   */
  private getDefaultTechSpec(): TechSpecOptions {
    return {
      cssFramework: 'tailwind',
      iconLibrary: 'lucide',
      includeJavaScript: true,
      optimizationLevel: 'basic',
    };
  }
  
  /**
   * 获取默认响应式设计配置
   */
  private getDefaultResponsive(): ResponsiveOptions {
    return {
      mobilePriority: true,
      breakpoints: {
        mobile: 640,
        tablet: 768,
        desktop: 1024,
      },
    };
  }
  
  /**
   * 渲染提示词
   * @param text 输入文本
   */
  render(text: string): string {
    const { language, includeAuthorInfo, designStyle, techSpec, responsive, contentEnhancement } = this.options;
    
    // 构建设计风格描述
    const designStyleText = this.buildDesignStyleText(designStyle);
    
    // 构建技术规范描述
    const techSpecText = this.buildTechSpecText(techSpec);
    
    // 构建响应式设计描述
    const responsiveText = this.buildResponsiveText(responsive);
    
    // 构建内容增强描述
    const contentEnhancementText = this.buildContentEnhancementText(contentEnhancement);
    
    // 构建提示词模板
    return `
# 任务：将文本转换为视觉吸引力强的网页

## 您的任务是将以下文本内容转换成一个视觉吸引力强的HTML网页。

## ⚠️ 特别重要说明 ⚠️
- 如果输入文本包含多日期内容（如周一至周五的菜单/日程表），您必须生成所有日期的完整内容
- 严禁使用任何形式的HTML注释来替代实际内容，例如"<!-- 周三至周五的内容省略 -->"、"<!-- 其余日期的食谱同样结构 -->"
- 在最终生成的HTML代码中，绝对不允许出现任何表示省略内容的注释或标记
- 必须为每一天生成独立的完整内容区块，不得省略任何一天

## 输入文本
${text}

## 要求

### 内容完整性（重要）
- 呈现输入文本中的所有核心内容，确保关键信息不丢失
- 对于多日期或多部分内容（如周一至周五的菜单、日程表等），必须完整展示所有日期或部分的内容
- 严格禁止使用HTML注释（如<!-- 周二至周五的内容省略 -->）或省略符号（如"等"、"..."）来替代实际内容
- 允许的简化方式：可以改进视觉布局、合并相似结构的容器、统一样式，但必须保留各部分的具体内容
- 不允许的简化方式：仅展示部分日期/项目作为示例、使用注释替代内容、合并不同日期/类别的内容
- 在设计时平衡内容完整性和视觉呈现，两者同等重要

### 内容组织与呈现
- 使用${language === 'zh-CN' ? '简体中文' : '英文'}作为主要语言
- 在保留核心信息的基础上，可以进行适当的重写和组织，使内容更具结构性和吸引力
- 添加合适的标题、副标题来组织内容
- 重要内容应当突出显示，确保用户能够快速获取关键信息
- 对于多部分内容，使用清晰的视觉层次和分隔元素进行组织
${includeAuthorInfo ? '- 在页面底部添加作者信息和版权声明' : ''}
- 根据内容类型和结构，合理分段和排版

### 设计风格
${designStyleText}

### 技术规范
${techSpecText}

### 响应式设计
${responsiveText}

### 内容增强
${contentEnhancementText}

### 输出要求
- 提供完整的单一HTML文件，包含所有必要的CSS和JavaScript
- 确保HTML代码符合HTML5标准
- 只能输出HTML代码，不要返回其他解释或评论
- 确保代码可以直接在浏览器中运行，无需额外依赖
- 输出的HTML必须包含所有输入内容的实现，不得使用注释或省略符号替代任何部分
- 创建既保留内容完整性又具有出色视觉体验的网页

请根据以上要求，创建一个专业、美观且功能完善的网页。
`;
  }
  
  /**
   * 构建设计风格描述文本
   */
  private buildDesignStyleText(style: DesignStyleOptions): string {
    let styleDescription = '';
    
    // 基于风格名称添加描述
    switch (style.styleName) {
      case 'minimal':
        styleDescription += '- 采用简约现代的设计风格，参考Linear App的设计语言\n';
        styleDescription += '- 注重留白和内容的清晰展示\n';
        styleDescription += '- 使用简洁的布局和精简的元素\n';
        break;
      case 'modern':
        styleDescription += '- 采用当代现代的设计风格，干净利落\n';
        styleDescription += '- 使用大胆的排版和现代化的元素\n';
        styleDescription += '- 强调视觉层次和用户体验\n';
        break;
      case 'classic':
        styleDescription += '- 采用经典优雅的设计风格\n';
        styleDescription += '- 使用传统的布局和经典的设计元素\n';
        styleDescription += '- 注重可读性和内容的清晰表达\n';
        break;
      case 'playful':
        styleDescription += '- 采用活泼有趣的设计风格\n';
        styleDescription += '- 使用鲜艳的色彩和创意的元素\n';
        styleDescription += '- 增加适当的互动和趣味性元素\n';
        break;
      case 'corporate':
        styleDescription += '- 采用专业商务的设计风格\n';
        styleDescription += '- 使用沉稳的色调和结构化的布局\n';
        styleDescription += '- 注重信息的清晰传达和专业形象\n';
        break;
    }
    
    // 添加配色方案描述
    if (style.colorScheme === 'custom' && style.customColors) {
      styleDescription += `- 使用自定义配色方案: 主色调${style.customColors.primary}，辅助色${style.customColors.secondary}，强调色${style.customColors.accent}\n`;
    } else {
      styleDescription += `- 使用${this.getColorSchemeDescription(style.colorScheme)}配色方案\n`;
    }
    
    // 添加动画描述
    if (style.includeAnimations) {
      switch (style.animationLevel) {
        case 'subtle':
          styleDescription += '- 添加微妙的过渡和交互动画，提升用户体验但不分散注意力\n';
          break;
        case 'moderate':
          styleDescription += '- 添加适量的动画和过渡效果，提升页面活力\n';
          break;
        case 'dynamic':
          styleDescription += '- 添加丰富的动画和交互效果，创造动感的用户体验\n';
          break;
      }
    }
    
    return styleDescription;
  }
  
  /**
   * 获取配色方案描述
   */
  private getColorSchemeDescription(scheme: string): string {
    switch (scheme) {
      case 'blue': return '蓝色基调的';
      case 'green': return '绿色基调的';
      case 'purple': return '紫色基调的';
      case 'orange': return '橙色基调的';
      case 'neutral': return '中性色调的';
      default: return '灵活的';
    }
  }
  
  /**
   * 构建技术规范描述文本
   */
  private buildTechSpecText(spec: TechSpecOptions): string {
    let text = '';
    
    // CSS框架
    switch (spec.cssFramework) {
      case 'tailwind':
        text += '- 使用Tailwind CSS进行样式设计（通过CDN引入）\n';
        break;
      case 'bootstrap':
        text += '- 使用Bootstrap进行样式设计（通过CDN引入）\n';
        break;
      case 'pure-css':
        text += '- 使用纯CSS进行样式设计，不依赖外部框架\n';
        break;
    }
    
    // 图标库
    switch (spec.iconLibrary) {
      case 'fontawesome':
        text += '- 使用Font Awesome图标库增强视觉元素\n';
        break;
      case 'material':
        text += '- 使用Material Icons图标库增强视觉元素\n';
        break;
      case 'lucide':
        text += '- 使用Lucide图标库增强视觉元素\n';
        break;
    }
    
    // JavaScript功能
    if (spec.includeJavaScript) {
      text += '- 添加适当的JavaScript功能，增强用户交互体验\n';
      text += '- 实现平滑滚动、图片展示等交互功能\n';
    }
    
    // 优化级别
    switch (spec.optimizationLevel) {
      case 'basic':
        text += '- 基本的性能优化：图像优化、简洁的代码结构\n';
        break;
      case 'advanced':
        text += '- 高级性能优化：懒加载、代码拆分、高效的DOM操作\n';
        break;
    }
    
    return text;
  }
  
  /**
   * 构建响应式设计描述文本
   */
  private buildResponsiveText(responsive: ResponsiveOptions): string {
    let text = '';
    
    text += '- 实现完全响应式设计，确保在各种设备上都有良好的显示效果\n';
    
    if (responsive.mobilePriority) {
      text += '- 采用移动优先的设计理念，优化移动设备上的用户体验\n';
    }
    
    text += `- 设定合理的断点：移动端(${responsive.breakpoints.mobile}px)、平板(${responsive.breakpoints.tablet}px)、桌面(${responsive.breakpoints.desktop}px)\n`;
    text += '- 确保字体大小、间距和布局在不同屏幕尺寸上都保持适宜的比例\n';
    
    return text;
  }
  
  /**
   * 构建内容增强描述文本
   */
  private buildContentEnhancementText(enhancement: StandardTemplateOptions['contentEnhancement']): string {
    let text = '';
    
    if (enhancement.smartFormatting) {
      text += '- 智能格式化文本内容，改善可读性和结构\n';
      text += '- 使用适当的标题层级、列表和强调来突出重要信息\n';
    }
    
    if (enhancement.addDefinitions) {
      text += '- 为专业术语或复杂概念添加解释和定义\n';
    }
    
    if (enhancement.visualizeData) {
      text += '- 将数据和统计信息可视化为图表或图形，增强内容表现力\n';
    }
    
    text += '- 添加适当的分割线、卡片或其他视觉元素，改善内容组织\n';
    
    return text;
  }
} 