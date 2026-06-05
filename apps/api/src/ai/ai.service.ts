import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RepositoryVisibility } from '@relax-git/shared/generated/prisma-client';
import OpenAI from 'openai';
import { PrismaService } from '../database/prisma.service';

const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-flash';

/**
 * AI 服务 - 集成 DeepSeek API
 * 提供仓库发现、仓库简介与代码分析等 AI 功能
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: OpenAI | null = null;
  private isEnabled = false;
  private readonly modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.modelName =
      this.configService.get<string>('DEEPSEEK_MODEL')?.trim() ||
      DEFAULT_DEEPSEEK_MODEL;
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
      this.logger.log(
        `DeepSeek AI initialized successfully (model: ${this.modelName})`
      );
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

  getModelName(): string {
    return this.modelName;
  }

  /**
   * 仓库助手问答（支持三种模式）
   * @param message 用户消息
   * @param conversationHistory 对话历史
   * @param mode AI 模式：discovery=仓库发现, thinking=仓库简介/分析, chat=补充问答
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    mode: 'discovery' | 'thinking' | 'chat' = 'discovery'
  ): Promise<{
    reply: string;
    reasoning?: string;
    elapsedMs?: number;
    model?: string;
  }> {
    if (!this.isAvailable()) {
      return {
        reply: '仓库助手当前不可用，请稍后再试。',
      };
    }

    try {
      // 根据模式选择系统提示词
      const systemPrompt = this.getSystemPrompt(mode);
      const repositoryContext = await this.buildRepositoryContext(message);

      const messages: any[] = [
        {
          role: 'system',
          content: `${systemPrompt}\n\n${repositoryContext}`,
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

      this.logger.log(
        `Sending repository assistant request to DeepSeek (model: ${this.modelName}, mode: ${mode})`
      );

      // 根据模式调整参数
      const params = this.getModelParams(mode);

      // 根据模式调整超时时间
      const timeout = 45000;
      const startedAt = Date.now();

      const response = await this.client!.chat.completions.create(
        {
          model: this.modelName,
          messages,
          ...params,
          ...this.getThinkingParams(mode),
          stream: false,
        } as any,
        { timeout }
      );
      const elapsedMs = Date.now() - startedAt;

      const content =
        response.choices[0]?.message?.content ||
        '抱歉，我现在无法完成这次回答。';
      const reasoning = (response.choices[0]?.message as any)
        ?.reasoning_content;

      this.logger.log(
        `DeepSeek response received (model: ${this.modelName}, mode: ${mode}, elapsedMs: ${elapsedMs})`
      );

      return {
        reply: content,
        ...(reasoning ? { reasoning } : {}),
        elapsedMs,
        model: this.modelName,
      };
    } catch (error: any) {
      this.logger.error(`DeepSeek error (model: ${this.modelName}):`, error);
      this.logger.error('Error details:', {
        status: error?.status,
        message: error?.message,
        response: error?.response?.data,
      });

      if (error?.status === 402) {
        return {
          reply: '仓库助手当前不可用，请稍后再试。',
        };
      }

      if (error?.status === 429) {
        return {
          reply: '抱歉，当前请求过于频繁，请稍后再试。',
        };
      }

      if (error?.status === 401) {
        return {
          reply: '仓库助手当前不可用，请稍后再试。',
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
        model: this.modelName,
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
        model: this.modelName,
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
    const formatInstruction = `
  When answering with structured suggestions, ALWAYS use this exact format:
  主题：一句话概括
  要点：2-4 条
  建议：1-2 句可执行结论

  Example:
  主题：项目启动排查
  要点：
  - 检查依赖服务是否启动
  - 确认环境变量是否完整
  建议：先从数据库和 Redis 开始排查，能最快定位问题。`;

    switch (mode) {
      case 'discovery':
        // 探索模式 - 结构化分析与方案梳理
        return `You are DeepSeek, a helpful AI assistant specialized in graduation project analysis and practical guidance.

Core principles:
  - Be proactive: Suggest 4-6 actionable ideas per query, prioritizing usefulness and clarity
  - Be accurate: Verify steps, dependencies, and configuration details
  - Be engaging: Use conversational yet professional language
  - Be diverse: Cover architecture, deployment, debugging, and presentation needs

Approach:
  - Requirement queries → 5-6 concrete suggestions (include 1-2 alternatives)
  - Specific feature queries → Brief context + 4 related options
  - Broad requests → 4-5 curated suggestions based on user intent
- Keep responses concise, informative, and actionable

${formatInstruction}

  Focus on helping users make the project easier to explain, run, and defend. Quality over quantity.`;

      case 'thinking':
        // 思考模式 - 深度分析，快速聚焦
        return `You are DeepSeek, a pragmatic AI assistant delivering sharp, insightful project analysis.

Focus:
  - Analyze architecture, tradeoffs, and operational risks
  - Highlight practical significance concisely
  - Recommend 2-3 carefully selected implementation paths
- Keep analysis focused and impactful (avoid verbosity)

Response style:
  - Design questions → 2-3 core options with key insights
  - Implementation questions → Direct critique + 2 comparisons
  - Discussions → Concrete examples, clear points

${formatInstruction}

  Deliver depth efficiently. Quality insights, not lengthy prose.`;

      case 'chat':
        // 补充问答模式 - 用于围绕仓库发现继续追问
        return `You are DeepSeek, a friendly AI assistant who helps with graduation project work.

Core principles:
  - Be conversational: Talk like a knowledgeable friend, not a database
  - Be empathetic: Connect with the user's current progress and constraints
  - Be thoughtful: Suggest 2-3 next steps that genuinely fit the moment
  - Be natural: Let recommendations emerge organically from conversation

Approach:
  - Shared experiences → Engage authentically + 2 relevant suggestions
  - Casual discussion → Participate naturally, subtly introduce 1-2 ideas
  - Direct requests → Understand constraints contextually + 3 tailored picks
- Maintain warmth and relatability throughout

${formatInstruction}

  The best conversations feel effortless. Be genuine, listen well, and help move the project forward.`;

      default:
        return this.getSystemPrompt('discovery');
    }
  }

  private async buildRepositoryContext(message: string): Promise<string> {
    try {
      const baseWhere = {
        isActive: true,
        isPublished: true,
        visibility: {
          in: [RepositoryVisibility.PUBLIC, RepositoryVisibility.INTERNAL],
        },
      };
      const terms = this.extractRepositorySearchTerms(message);
      const matchWhere =
        terms.length > 0
          ? {
              ...baseWhere,
              OR: terms.flatMap(term => [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { language: { contains: term, mode: 'insensitive' } },
                { tags: { has: term } },
              ]),
            }
          : baseWhere;

      const select = {
        id: true,
        name: true,
        description: true,
        tags: true,
        language: true,
        stars: true,
        viewCount: true,
        trendingScore: true,
        updatedAt: true,
      };
      const orderBy = [
        { trendingScore: 'desc' },
        { stars: 'desc' },
        { viewCount: 'desc' },
        { updatedAt: 'desc' },
      ];

      const [matched, popular] = await Promise.all([
        this.prisma.repository.findMany({
          where: matchWhere as any,
          select,
          orderBy: orderBy as any,
          take: 8,
        }),
        this.prisma.repository.findMany({
          where: baseWhere as any,
          select,
          orderBy: orderBy as any,
          take: 8,
        }),
      ]);

      const seen = new Set<string>();
      const repositories = [...matched, ...popular].filter(repo => {
        if (seen.has(repo.id)) return false;
        seen.add(repo.id);
        return true;
      });

      if (repositories.length === 0) {
        return [
          '本地社区仓库数据：当前没有已发布的公开或内部仓库。',
          '回答仓库推荐问题时，请直接说明暂无本地社区数据，不要编造仓库。',
        ].join('\n');
      }

      const lines = repositories.slice(0, 10).map((repo, index) => {
        const tags =
          Array.isArray(repo.tags) && repo.tags.length > 0
            ? repo.tags.join(', ')
            : '无标签';
        const description =
          repo.description?.replace(/\s+/g, ' ').trim() || '暂无简介';
        return `${index + 1}. ${repo.name} | 语言: ${repo.language || '未知'} | 标签: ${tags} | 点赞: ${repo.stars} | 浏览: ${repo.viewCount} | 热度: ${repo.trendingScore.toFixed(2)} | 简介: ${description}`;
      });

      return [
        '本地社区仓库数据（仅包含已发布的公开/内部仓库，优先使用这些数据回答推荐、检索和简介问题）：',
        ...lines,
        '回答约束：推荐仓库时优先引用上面的真实仓库；如果用户方向与数据不匹配，请说明未找到完全匹配项并给出相近仓库。',
      ].join('\n');
    } catch (error) {
      this.logger.warn(`Failed to build repository context: ${error}`);
      return '本地社区仓库数据暂时不可读取。回答时请说明数据源暂不可用，避免编造本地仓库。';
    }
  }

  private extractRepositorySearchTerms(message: string): string[] {
    const ignore = new Set([
      '帮我',
      '请帮',
      '推荐',
      '仓库',
      '项目',
      '方向',
      '简介',
      '介绍',
      '热门',
      '检索',
      '查找',
      '一下',
      '目前',
      '前十',
    ]);
    const matches =
      message.match(/[A-Za-z0-9+#._-]{2,}|[\u4e00-\u9fff]{2,}/g) ?? [];
    return Array.from(
      new Set(
        matches
          .map(term => term.trim())
          .filter(term => term.length >= 2 && !ignore.has(term))
      )
    ).slice(0, 8);
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
          temperature: 0.7,
          max_tokens: 900,
          top_p: 0.9,
          frequency_penalty: 0.0, // 官网默认（让模型自然发挥）
          presence_penalty: 0.0, // 官网默认
        };

      case 'thinking':
        // 思考模式 - 平衡深度与速度
        return {
          temperature: 0.8,
          max_tokens: 1200,
          top_p: 0.9,
          frequency_penalty: 0.0, // 让模型充分思考
          presence_penalty: 0.0, // 鼓励深度探讨
        };

      case 'chat':
        // 补充问答模式
        return {
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.9,
          frequency_penalty: 0.0, // 自然对话，不限制重复
          presence_penalty: 0.0, // 让对话自然流畅
        };

      default:
        return this.getModelParams('discovery');
    }
  }

  private getThinkingParams(mode: 'discovery' | 'thinking' | 'chat') {
    if (mode === 'thinking') {
      return {
        thinking: { type: 'enabled' },
        reasoning_effort: 'high',
      };
    }

    return {
      // deepseek-v4-flash 默认开启 thinking；普通聊天显式关闭，避免非流式回复被推慢。
      thinking: { type: 'disabled' },
    };
  }
}
