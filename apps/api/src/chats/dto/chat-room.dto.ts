import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateDirectChatDto {
  @IsUUID('4', { message: '目标用户 ID 格式不正确' })
  userId!: string;
}

export class CreateGroupChatDto {
  @IsString({ message: '群聊名称不能为空' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 50, { message: '群聊名称需在 1~50 个字符之间' })
  name!: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: '成员列表不能为空' })
  @IsUUID('4', { each: true, message: '成员 ID 格式不正确' })
  memberIds?: string[];
}

export class AddMembersDto {
  @IsArray({ message: '成员列表必须是数组' })
  @ArrayNotEmpty({ message: '至少添加一位成员' })
  @IsUUID('4', { each: true, message: '成员 ID 格式不正确' })
  memberIds!: string[];
}
