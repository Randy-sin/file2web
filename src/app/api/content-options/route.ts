import { NextResponse } from 'next/server';
import { ContentType, DesignStylePreset } from '@/lib/prompts';
import { presetProvider } from '@/lib/prompts/presets';

export const dynamic = 'force-dynamic';

/**
 * GET /api/content-options
 * 
 * 返回可用的内容类型和设计风格选项
 * 
 * 响应:
 * {
 *   contentTypes: string[],
 *   designStyles: string[]
 * }
 */
export async function GET() {
  try {
    // 获取所有可用的内容类型和设计风格
    const contentTypes = Object.values(ContentType);
    const designStyles = presetProvider.getAllDesignStylePresets();
    
    return NextResponse.json({
      contentTypes,
      designStyles
    });
  } catch (error) {
    console.error('获取内容选项时出错:', error);
    
    return NextResponse.json(
      { error: '获取内容选项失败' },
      { status: 500 }
    );
  }
} 