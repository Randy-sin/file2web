import { NextResponse } from 'next/server';
import { ContentType, DesignStylePreset } from '@/lib/prompts';
import { presetProvider } from '@/lib/prompts/presets';

export const dynamic = 'force-dynamic';

/**
 * POST /api/detect-content
 * 
 * 自动检测文本的内容类型
 * 
 * 请求体:
 * {
 *   text: string
 * }
 * 
 * 响应:
 * {
 *   contentType: string,
 *   designStyle: string
 * }
 */
export async function POST(request: Request) {
  try {
    // 解析请求体获取文本内容
    const { text } = await request.json();
    
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: '请提供文本内容' },
        { status: 400 }
      );
    }
    
    // 检测文本内容类型
    const contentType = presetProvider.detectContentType(text);
    
    // 获取对应内容类型的默认设计风格
    const contentConfig = presetProvider.getContentTypeConfig(contentType);
    const designStyleOptions = contentConfig.designStyle;
    
    // 找到匹配的设计风格预设
    let detectedDesignStyle: string | null = null;
    const designStylePresets = Object.values(DesignStylePreset);
    
    for (const preset of designStylePresets) {
      const presetOptions = presetProvider.getDesignStylePreset(preset);
      
      // 简单比较设计风格选项是否匹配
      if (presetOptions.styleName === designStyleOptions?.styleName && 
          presetOptions.colorScheme === designStyleOptions?.colorScheme) {
        detectedDesignStyle = preset;
        break;
      }
    }
    
    return NextResponse.json({
      contentType,
      designStyle: detectedDesignStyle
    });
  } catch (error) {
    console.error('检测内容类型时出错:', error);
    
    return NextResponse.json(
      { error: '检测内容类型失败' },
      { status: 500 }
    );
  }
} 