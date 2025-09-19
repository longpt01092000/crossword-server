import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { HashtagService } from './hashtag.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { HashtagResponseDto } from './model/hashtag.model';
import { AuthGuard, Roles } from '../auth/auth.guard';
import {
  parseSort,
  PlainToInstance,
  PlainToInstanceArray,
} from '../../utils/function.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginationResult } from '../../interfaces/pagination-result.interface';
import { UserRole } from '../auth/auth.model';

@ApiTags('hashtags')
@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Get('admin')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all hashtags with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of hashtags',
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginationResult<HashtagResponseDto>> {
    const { items, page, limit, total, totalPages } =
      await this.hashtagService.findAll({
        page: query.page,
        limit: query.limit,
        sort: query.sort ? parseSort(query.sort) : undefined,
      });

    const newItems = PlainToInstanceArray(HashtagResponseDto, items);
    return { items: newItems, page, limit, total, totalPages };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active hashtags' })
  @ApiResponse({
    status: 200,
    description: 'List of active hashtags',
    type: [HashtagResponseDto],
  })
  async findActive() {
    const hashtags = await this.hashtagService.findActiveHashtags();
    return PlainToInstance(HashtagResponseDto, hashtags);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hashtag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Hashtag found',
    type: HashtagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Hashtag not found' })
  async findOne(@Param('id') id: string): Promise<HashtagResponseDto> {
    const hashtag = await this.hashtagService.findById(id);
    return PlainToInstance(HashtagResponseDto, hashtag);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new hashtag' })
  @ApiResponse({
    status: 201,
    description: 'Hashtag created successfully',
    type: HashtagResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createHashtagDto: CreateHashtagDto,
  ): Promise<HashtagResponseDto> {
    const hashtag = await this.hashtagService.createHashtag(createHashtagDto);
    return PlainToInstance(HashtagResponseDto, hashtag);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update hashtag' })
  @ApiResponse({
    status: 200,
    description: 'Hashtag updated successfully',
    type: HashtagResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Hashtag not found' })
  async update(
    @Param('id') id: string,
    @Body() updateHashtagDto: UpdateHashtagDto,
  ): Promise<HashtagResponseDto> {
    const hashtag = await this.hashtagService.updateHashtag(
      id,
      updateHashtagDto,
    );
    return PlainToInstance(HashtagResponseDto, hashtag);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete hashtag' })
  @ApiResponse({
    status: 200,
    description: 'Hashtag deleted successfully',
    type: HashtagResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Hashtag not found' })
  async remove(@Param('id') id: string): Promise<HashtagResponseDto> {
    const hashtag = await this.hashtagService.delete(id);
    return PlainToInstance(HashtagResponseDto, hashtag);
  }
}
