import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * AI 服务 - 集成 DeepSeek API
 * 提供聊天对话、代码分析等 AI 功能
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: OpenAI | null = null;
  private isEnabled = false;

  constructor(private readonly configService: ConfigService) {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = this.configService.get<string>('ZHIPU_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'ZHIPU_API_KEY not configured - AI features will be disabled'
      );
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
      });
      this.isEnabled = true;
      this.logger.log('Zhipu AI (ChatGLM) initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Zhipu AI:', error);
    }
  }

  /**
   * 检查 AI 服务是否可用
   */
  isAvailable(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * 聊天对话
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    if (!this.isAvailable()) {
      return '抱歉，AI 服务暂时不可用。请联系管理员配置 DEEPSEEK_API_KEY。';
    }

    try {
      const messages: any[] = [
        {
          role: 'system',
          content: `你是 Relax-Git 平台的专业开发者顾问 👨‍💻

## 核心身份
- 🎯 资深全栈开发专家，精通前后端技术栈
- 🏗️ 软件架构师，擅长系统设计和技术选型
- 📚 技术导师，能提供清晰的学习路径和最佳实践
- 🔧 问题解决专家，快速定位和解决技术难题

## 专业领域
**前端技术**: React/Vue/Angular, TypeScript, Next.js, 性能优化, 工程化
**后端技术**: Node.js, NestJS, Express, 数据库设计, API 架构
**DevOps**: Docker, CI/CD, 部署策略, 监控运维
**代码质量**: 代码审查, 重构, 测试策略, 安全最佳实践

## 回复原则
- 💡 **技术精准**: 提供准确的技术建议和解决方案
- 🎯 **实用导向**: 重点关注可执行的具体步骤
- 📖 **知识传递**: 不仅给答案，更要解释原理和最佳实践
- ⚡ **简洁高效**: 核心信息控制在 2-3 段，避免冗长

## 对话风格
- 专业但友好，像资深同事交流
- 用代码示例和具体方案说话
- 适度使用技术 emoji 增强表达
- 遇到复杂问题时，提供分步骤的解决方案

## Relax-Git 平台特色
现代化代码协作平台：Git 仓库托管、实时开发者聊天、代码评论系统、技术社区

## 回复模板
**问题诊断**: 快速识别问题核心
**解决方案**: 提供 2-3 个可选方案
**最佳实践**: 补充相关的开发建议
**延伸学习**: 推荐深入学习的方向（可选）`,
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ];

      this.logger.debug(`Sending chat request to Zhipu AI`);

      const response = await this.client!.chat.completions.create({
        model: 'glm-4-flash',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.85,
      });

      const reply =
        response.choices[0]?.message?.content || '抱歉，我暂时无法回答。';

      this.logger.debug(`Zhipu AI response received`);

      return reply;
    } catch (error: any) {
      this.logger.error('Zhipu AI error:', error);
      this.logger.error('Error details:', {
        status: error?.status,
        message: error?.message,
        response: error?.response?.data,
      });

      if (error?.status === 402) {
        return '抱歉，AI 服务余额不足。请联系管理员充值账户。';
      }

      if (error?.status === 429) {
        return '抱歉，当前请求过于频繁，请稍后再试。';
      }

      if (error?.status === 401) {
        return '抱歉，AI 服务认证失败，请联系管理员检查配置。';
      }

      return '抱歉，处理您的消息时出现了错误，请稍后重试。';
    }
  }

  /**
   * 生成 Git 提交信息
   */
  async generateCommitMessage(diff: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available');
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个 Git 提交信息生成助手。根据代码变更生成简洁、清晰的提交信息。

格式要求：
- 使用中文
- 第一行：简短描述（不超过50字）
- 空一行
- 详细说明：列出主要变更

示例：
feat: 添加用户头像上传功能

- 新增头像上传 API 接口
- 支持 PNG/JPEG/WEBP 格式
- 添加文件大小和类型验证`,
          },
          {
            role: 'user',
            content: `请为以下代码变更生成提交信息：\n\n${diff}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || 'chore: 更新代码';
    } catch (error) {
      this.logger.error('Failed to generate commit message:', error);
      throw error;
    }
  }

  /**
   * 代码审查
   */
  async reviewCode(code: string, language?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available');
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个代码审查专家。分析代码质量、潜在问题和改进建议。

审查要点：
1. 代码质量和可读性
2. 潜在的 bug 和安全问题
3. 性能优化建议
4. 最佳实践建议

用中文回答，保持专业和建设性的语气。`,
          },
          {
            role: 'user',
            content: `请审查以下${language || ''}代码：\n\n${code}`,
          },
        ],
        temperature: 0.6,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || '暂无审查意见';
    } catch (error) {
      this.logger.error('Failed to review code:', error);
      throw error;
    }
  }
}
