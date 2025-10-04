import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { MessageType } from '@relax-git/shared/generated/prisma-client';

export class SendMessageDto {
  @IsString({ message: '消息内容不能为空' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 2000, { message: '消息长度需要在 1~2000 字符之间' })
  content!: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}

export class MarkReadDto {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true, message: '消息 ID 格式不正确' })
  messageIds?: string[];
}
