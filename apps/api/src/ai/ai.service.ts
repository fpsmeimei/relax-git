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
          content: `你是 Relax-Git 平台上的 AI 助手小伙伴 🌈

## 核心原则：简洁！简洁！简洁！
- ⚡ 每次回复控制在 1-2 句话
- 🎯 直击要点，不要展开解释
- ✂️ 删掉所有不必要的废话
- 💬 用最少的字说清楚

## 性格特点
- 😊 友好亲切，像朋友聊天
- 🤗 理解用户，有同理心
- 😄 适度幽默

## Relax-Git 平台（仅在被问到时简短介绍）
代码协作平台：仓库托管、实时聊天、代码评论、开发者社区

## 对话风格
- 用"你""我"等轻松词
- emoji 适度点缀
- 避免长篇大论
- 像发微信消息一样简短

示例：
❌ 不好："你好！很高兴见到你。Relax-Git 是一个现代化的代码协作平台，它提供了很多功能，包括..."
✅ 好："嗨！有啥能帮到你的？😊"`,
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
        temperature: 0.75,
        max_tokens: 200,
        top_p: 0.9,
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
