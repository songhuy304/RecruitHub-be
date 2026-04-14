import { IApiBaseResponse } from '@/common/response/response.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PostCreateResponseDto } from '../dtos/reponse';
import { PostCreateDto, PostGetDto } from '../dtos/request';
import { PostService } from '../services/post.service';

@ApiTags('POST')
@Controller('/posts')
export class PostPublicController {
  constructor(private readonly postService: PostService) {}

  @Get(':id')
  public getPost(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPost(postId);
  }

  @Get()
  public getPosts(@Query() params: PostGetDto) {
    return this.postService.getAllRepo(params);
  }

  @Post()
  public createPost(
    @Body() payload: PostCreateDto,
  ): Promise<PostCreateResponseDto> {
    return this.postService.create(payload);
  }
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  public deletePost(
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<IApiBaseResponse> {
    return this.postService.delete(postId);
  }
}
