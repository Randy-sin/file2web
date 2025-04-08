import { NextResponse } from 'next/server';
import { templateManager } from '@/lib/prompts';

/**
 * 获取系统提示词API
 * 
 * 根据提供的参数返回对应的系统提示词
 * 支持传入templateName参数
 * 如果没有指定模板名称，将使用默认模板
 */
export async function GET(request: Request) {
  try {
    // 获取URL参数
    const url = new URL(request.url);
    const templateName = url.searchParams.get('templateName');
    const text = url.searchParams.get('text') || '';
    
    let promptText = '';
    let templateInfo = {
      name: templateName || 'standard',
      type: '',
    };
    
    // 根据参数获取模板
    if (templateName) {
      // 如果指定了模板名称，直接获取该模板
      const template = templateManager.get(templateName);
      if (template) {
        promptText = template.render(text);
        templateInfo.name = templateName;
        templateInfo.type = '指定模板';
      } else {
        // 如果找不到指定模板，返回错误
        return NextResponse.json({ error: `找不到名为 ${templateName} 的模板` }, { status: 404 });
      }
    } else {
      // 使用默认模板或自动选择
      const template = templateManager.getDefaultTemplate() || templateManager.autoSelect(text);
      if (template) {
        promptText = template.render(text);
        templateInfo.type = '默认模板';
      } else {
        return NextResponse.json({ error: '未找到合适的模板' }, { status: 500 });
      }
    }
    
    // 返回提示词和模板信息
    return NextResponse.json({ 
      prompt: promptText,
      template: templateInfo
    });
  } catch (error) {
    console.error('获取提示词出错:', error);
    return NextResponse.json(
      { error: '获取提示词出错' },
      { status: 500 }
    );
  }
}