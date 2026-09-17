import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiResponseDto, PaginatedResponseDto } from '@/common/response';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from '../dtos/requests/create-post.dto';
import { ListPostDto } from '../dtos/requests/list-post.dto';
import { PostResponseDto } from '../dtos/responses/post.response.dto';
import { PostService } from '../services/post.service';

@ApiTags('Posts')
@ApiBearerAuth('accessToken')
@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiEndpoint({
    summary: 'Create a post and publish it to selected channels',
    serialization: PostResponseDto,
    httpStatus: HttpStatus.CREATED,
    messageKey: 'post.created',
  })
  async create(
    @AuthUser() authUser: IAuthUser,
    @Body() dto: CreatePostDto,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    return this.postService.create(authUser.userId, dto);
  }

  @Get()
  @ApiEndpoint({
    summary: 'List posts',
    serialization: PostResponseDto,
    paginated: true,
    httpStatus: HttpStatus.OK,
    messageKey: 'post.list.fetched',
  })
  async list(
    @AuthUser() authUser: IAuthUser,
    @Query() query: ListPostDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return this.postService.list(authUser.userId, query);
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get post detail with per-channel status',
    serialization: PostResponseDto,
    httpStatus: HttpStatus.OK,
    messageKey: 'post.fetched',
  })
  async getById(
    @AuthUser() authUser: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    return this.postService.getById(authUser.userId, id);
  }

  @Post(':id/retry')
  @ApiEndpoint({
    summary: 'Retry failed channel targets of a post',
    serialization: PostResponseDto,
    httpStatus: HttpStatus.OK,
    messageKey: 'post.retried',
  })
  async retryFailed(
    @AuthUser() authUser: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    return this.postService.retryFailed(authUser.userId, id);
  }
}
