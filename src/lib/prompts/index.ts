import { StandardTemplate } from './templates/StandardTemplate';
import { templateManager } from './TemplateManager';

// 注册所有模板
// 标准模式模板
const standardTemplate = new StandardTemplate();
templateManager.register('standard', standardTemplate, true);

// 导出所有模板和管理器
export * from './types';
export * from './BaseTemplate';
// 避免重复导出TemplateManager
export * from './templates/StandardTemplate';
export * from './presets';

export { templateManager }; 