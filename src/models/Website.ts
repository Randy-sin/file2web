import mongoose, { Schema, Document } from 'mongoose';
import { nanoid } from 'nanoid';
import { connectMongoose } from '@/lib/mongodb';

// 确保在使用模型前连接到MongoDB
connectMongoose().catch(err => console.error('连接MongoDB失败:', err));

// 定义文件接口
interface IFile {
  name: string;
  content: string;
}

// 定义文件模式
const FileSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  }
});

// 定义网站接口
export interface IWebsite extends Document {
  urlId: string;
  title: string;
  files: IFile[];
  isMultiFile: boolean;
  createdAt: Date;
  expiresAt?: Date;
  views: number;
  lastAccessedAt?: Date;
}

// 创建网站模式
const WebsiteSchema: Schema = new Schema({
  urlId: { 
    type: String, 
    required: true,
    unique: true,
    default: () => nanoid(10) // 生成10位的唯一ID
  },
  title: {
    type: String,
    default: '未命名网页'
  },
  files: { 
    type: [FileSchema], 
    required: true,
    validate: [(val: IFile[]) => val.length > 0, '至少需要一个文件'] 
  },
  isMultiFile: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  expiresAt: { 
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

// 添加TTL索引，自动删除过期内容
WebsiteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// 添加urlId索引，提高查询性能
WebsiteSchema.index({ urlId: 1 });

// 避免在服务器端重复编译模型
export default mongoose.models.Website || mongoose.model<IWebsite>('Website', WebsiteSchema); 