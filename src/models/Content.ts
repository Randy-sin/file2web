import mongoose, { Schema, Document } from 'mongoose';

// 定义单文件内容的接口
export interface IContent extends Document {
  content: string;
  filename: string;
  createdAt: Date;
  expiresAt?: Date;
}

// 创建模式
const ContentSchema: Schema = new Schema({
  content: { 
    type: String, 
    required: true 
  },
  filename: { 
    type: String, 
    default: 'index.html' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  expiresAt: { 
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
    index: true
  }
});

// 添加TTL索引，自动删除过期内容
ContentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 避免在服务器端重复编译模型
export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema); 