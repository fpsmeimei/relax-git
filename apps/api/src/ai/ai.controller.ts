import { Body, Controller, Get, Post, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AiService } from './ai.service';

class ConversationMessageDto {
  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsString()
  content: string;
}

class ChatRequestDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false, type: [ConversationMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  conversationHistory?: ConversationMessageDto[];
}

class ChatResponseDto {
  @ApiProperty()
  reply: string;

  @ApiProperty()
  timestamp: string;
}

/**
 * AI 功能控制器
 * 提供聊天对话、代码分析等 AI 接口
 */
@ApiTags('ai')
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 检查 AI 服务状态
   */
  @Public()
  @Get('status')
  @ApiOperation({ summary: '检查 AI 服务状态' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'AI 服务状态',
  })
  async getStatus() {
    return {
      available: this.aiService.isAvailable(),
      provider: 'Zhipu AI',
      model: 'glm-4-flash',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 聊天对话
   */
  @Post('chat')
  @ApiOperation({ summary: '与 AI 聊天' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '聊天成功',
    type: ChatResponseDto,
  })
  async chat(
    @Body() body: ChatRequestDto,
    @CurrentUser('id') _userId: string
  ): Promise<ChatResponseDto> {
    const { message, conversationHistory = [] } = body;

    const reply = await this.aiService.chat(message, conversationHistory);

    return {
      reply,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 生成提交信息
   */
  @Post('generate-commit')
  @ApiOperation({ summary: '生成 Git 提交信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '生成成功',
  })
  async generateCommit(
    @Body() body: { diff: string },
    @CurrentUser('id') _userId: string
  ) {
    const message = await this.aiService.generateCommitMessage(body.diff);

    return {
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 代码审查
   */
  @Post('review-code')
  @ApiOperation({ summary: '代码审查' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '审查完成',
  })
  async reviewCode(
    @Body() body: { code: string; language?: string },
    @CurrentUser('id') _userId: string
  ) {
    const review = await this.aiService.reviewCode(body.code, body.language);

    return {
      review,
      timestamp: new Date().toISOString(),
    };
  }
}
