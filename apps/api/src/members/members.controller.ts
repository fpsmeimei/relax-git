import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  MemberRole,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepoAccess } from '../auth/decorators/repo-access.decorator';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import {
  AddMemberDto,
  MemberListResponseDto,
  QueryMembersDto,
  UpdateMemberRoleDto,
} from './dto';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('api/repositories/:repoId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  @ApiOperation({ summary: '成员列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '按用户名/邮箱模糊搜索',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: '按角色过滤',
    enum: MemberRole,
  })
  @ApiOkResponse({ type: MemberListResponseDto })
  async findAll(
    @Param('repoId') repoId: string,
    @Query() query: QueryMembersDto,
    @CurrentUser('id') _userId: string,
    @CurrentUser('role') _userRole: UserRole
  ) {
    return this.membersService.list(repoId, query);
  }

  @Post()
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  @ApiOperation({ summary: '添加成员' })
  async add(
    @Param('repoId') repoId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser('id') operatorId: string,
    @CurrentUser('role') _userRole: UserRole
  ) {
    const result = await this.membersService.add(repoId, dto, operatorId);
    return { success: true, ...result };
  }

  @Delete('me')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  @ApiOperation({ summary: '自退出仓库' })
  async selfRemove(
    @Param('repoId') repoId: string,
    @CurrentUser('id') userId: string
  ) {
    await this.membersService.selfRemove(repoId, userId);
    return { success: true };
  }

  @Delete(':userId')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  @ApiOperation({ summary: '移除成员' })
  @ApiParam({ name: 'userId' })
  async remove(
    @Param('repoId') repoId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') operatorId: string,
    @CurrentUser('role') _userRole: UserRole
  ) {
    await this.membersService.remove(repoId, targetUserId, operatorId);
    return { success: true };
  }

  @Patch(':userId/role')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  @ApiOperation({ summary: '变更成员角色' })
  @ApiParam({ name: 'userId' })
  async changeRole(
    @Param('repoId') repoId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser('id') operatorId: string
  ) {
    await this.membersService.changeRole(
      repoId,
      targetUserId,
      operatorId,
      dto.role
    );
    return { success: true };
  }
}
