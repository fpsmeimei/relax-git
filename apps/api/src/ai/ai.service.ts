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
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'DEEPSEEK_API_KEY not configured - AI features will be disabled'
      );
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com',
      });
      this.isEnabled = true;
      this.logger.log('DeepSeek v3.2 initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize DeepSeek AI:', error);
    }
  }

  /**
   * 检查 AI 服务是否可用
   */
  isAvailable(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * 聊天对话（支持三种模式）
   * @param message 用户消息
   * @param conversationHistory 对话历史
   * @param mode AI 模式：discovery=新鲜探索, thinking=深度思考, chat=闲聊对话
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    mode: 'discovery' | 'thinking' | 'chat' = 'discovery'
  ): Promise<{ reply: string; reasoning?: string }> {
    if (!this.isAvailable()) {
      return {
        reply: '抱歉，AI 服务暂时不可用。请联系管理员配置 DEEPSEEK_API_KEY。',
      };
    }

    try {
      // 根据模式选择系统提示词
      const systemPrompt = this.getSystemPrompt(mode);

      const messages: any[] = [
        {
          role: 'system',
          content: systemPrompt,
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

      this.logger.debug(
        `Sending chat request to DeepSeek v3.2 (mode: ${mode})`
      );

      // 根据模式调整参数
      const params = this.getModelParams(mode);

      // 根据模式调整超时时间
      const timeout = mode === 'thinking' ? 30000 : 60000; // 思考模式30秒，其他60秒

      const response = await this.client!.chat.completions.create(
        {
          model: 'deepseek-chat',
          messages,
          ...params,
          stream: false,
        },
        { timeout }
      );

      const content =
        response.choices[0]?.message?.content || '抱歉，我暂时无法回答。';

      this.logger.debug(`DeepSeek v3.2 response received (mode: ${mode})`);

      return {
        reply: content,
      };
    } catch (error: any) {
      this.logger.error('DeepSeek v3.2 error:', error);
      this.logger.error('Error details:', {
        status: error?.status,
        message: error?.message,
        response: error?.response?.data,
      });

      if (error?.status === 402) {
        return {
          reply: '抱歉，AI 服务余额不足。请联系管理员充值账户。',
        };
      }

      if (error?.status === 429) {
        return {
          reply: '抱歉，当前请求过于频繁，请稍后再试。',
        };
      }

      if (error?.status === 401) {
        return {
          reply: '抱歉，AI 服务认证失败，请联系管理员检查配置。',
        };
      }

      return {
        reply: '抱歉，处理您的消息时出现了错误，请稍后重试。',
      };
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
        max_tokens: 400,
        top_p: 0.9,
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
        max_tokens: 1200,
        top_p: 0.9,
      });

      return response.choices[0]?.message?.content || '暂无审查意见';
    } catch (error) {
      this.logger.error('Failed to review code:', error);
      throw error;
    }
  }

  /**
   * 根据模式获取系统提示词（完全对标 DeepSeek 官网）
   */
  private getSystemPrompt(mode: 'discovery' | 'thinking' | 'chat'): string {
    // DeepSeek 官网标准格式要求
    const formatInstruction = `
When recommending movies, ALWAYS use this exact format:
《中文片名》(year) [English Title] - Douban rating
Director: Name
Brief reason (1-2 sentences)

Example:
《肖申克的救赎》(1994) [The Shawshank Redemption] - 豆瓣9.7
Director: Frank Darabont
A timeless masterpiece about hope and freedom that touches the soul.`;

    switch (mode) {
      case 'discovery':
        // 探索模式 - 对标官网 Creative/Discovery 模式
        return `You are DeepSeek, a helpful AI assistant specialized in movie discovery and recommendations.

Core principles:
- Be proactive: Suggest 4-6 films per query, prioritizing diversity and fresh discoveries
- Be accurate: Verify directors, years, and Douban ratings
- Be engaging: Use conversational yet professional language
- Be diverse: Cover different genres, eras, and cinematic traditions

Approach:
- Genre queries → 5-6 recommendations (include 1-2 lesser-known gems)
- Specific film queries → Brief context + 4 similar recommendations
- Broad requests → 4-5 curated suggestions based on user intent
- Keep responses concise, informative, and actionable

${formatInstruction}

Focus on helping users discover films they'll genuinely enjoy. Quality over quantity.`;

      case 'thinking':
        // 思考模式 - 深度分析，快速聚焦
        return `You are DeepSeek, a film critic delivering sharp, insightful analysis.

Focus:
- Analyze themes, cinematography, and directorial craft
- Highlight artistic significance concisely
- Recommend 2-3 carefully selected films
- Keep analysis focused and impactful (avoid verbosity)

Response style:
- Genre queries → 2-3 defining works with key insights
- Film queries → Direct critique + 2 comparisons
- Discussions → Concrete examples, clear points

${formatInstruction}

Deliver depth efficiently. Quality insights, not lengthy prose.`;

      case 'chat':
        // 聊天模式 - 对标官网标准对话模式
        return `You are DeepSeek, a friendly AI assistant who loves talking about movies.

Core principles:
- Be conversational: Talk like a knowledgeable friend, not a database
- Be empathetic: Connect with user's emotions and viewing contexts
- Be thoughtful: Suggest 2-3 films that genuinely fit the moment
- Be natural: Let recommendations emerge organically from conversation

Approach:
- Shared experiences → Engage authentically + 2 relevant suggestions
- Casual discussion → Participate naturally, subtly introduce 1-2 films
- Direct requests → Understand preferences contextually + 3 tailored picks
- Maintain warmth and relatability throughout

${formatInstruction}

The best conversations feel effortless. Be genuine, listen well, and share your passion authentically.`;

      default:
        return this.getSystemPrompt('discovery');
    }
  }

  /**
   * 根据模式获取模型参数（完全对标 DeepSeek 官网配置）
   */
  private getModelParams(mode: 'discovery' | 'thinking' | 'chat'): {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  } {
    switch (mode) {
      case 'discovery':
        // 探索模式 - 对标官网 Creative 模式
        return {
          temperature: 1.0, // 官网 Creative 标准值
          max_tokens: 4096, // 官网标准长输出
          top_p: 0.95, // 官网默认值
          frequency_penalty: 0.0, // 官网默认（让模型自然发挥）
          presence_penalty: 0.0, // 官网默认
        };

      case 'thinking':
        // 思考模式 - 平衡深度与速度
        return {
          temperature: 1.1, // 保持创造力但更聚焦
          max_tokens: 4096, // 足够深度分析，响应更快
          top_p: 0.92, // 稍微降低随机性，提升速度
          frequency_penalty: 0.0, // 让模型充分思考
          presence_penalty: 0.0, // 鼓励深度探讨
        };

      case 'chat':
        // 聊天模式 - 对标官网标准对话模式
        return {
          temperature: 1.0, // 官网标准对话温度
          max_tokens: 4096, // 官网标准输出长度
          top_p: 0.95, // 官网默认值
          frequency_penalty: 0.0, // 自然对话，不限制重复
          presence_penalty: 0.0, // 让对话自然流畅
        };

      default:
        return this.getModelParams('discovery');
    }
  }
}
