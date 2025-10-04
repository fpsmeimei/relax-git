import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { FriendRequestStatus } from '@relax-git/shared/generated/prisma-client';

export class SearchFriendsQueryDto {
  @IsString()
  @Transform(({ value }) => (value ?? '').trim())
  keyword!: string;
}

export class FriendRequestsQueryDto {
  @IsOptional()
  @IsEnum({
    PENDING: FriendRequestStatus.PENDING,
    ACCEPTED: FriendRequestStatus.ACCEPTED,
    REJECTED: FriendRequestStatus.REJECTED,
    ALL: 'ALL',
  })
  status?: FriendRequestStatus | 'ALL';
}

export class SendFriendRequestDto {
  @IsString({ message: '好友 ID 格式不正确' })
  toUserId!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(0, 200, { message: '申请留言长度需在 200 字以内' })
  message?: string | null;
}

export class FriendRequestIdParamDto {
  @IsString({ message: '好友申请 ID 格式不正确' })
  id!: string;
}

export class RemoveFriendParamDto {
  @IsString({ message: '好友 ID 格式不正确' })
  friendId!: string;
}
