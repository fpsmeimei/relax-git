import { Matches } from 'class-validator';

export class CreateDirectChatDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: '目标用户 ID 格式不正确' })
  userId!: string;
}
