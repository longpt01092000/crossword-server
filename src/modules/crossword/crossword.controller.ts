import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FilterQuery, Types } from 'mongoose';

import { CrosswordService } from './crossword.service';
import { CreateCrosswordDto } from './dto/create-crossword.dto';
import { UpdateCrosswordDto } from './dto/update-crossword.dto';
import { QueryCrosswordDto } from './dto/query-crossword.dto';
import { GenerateCrosswordDto } from './dto/generate-crossword.dto';
import { CreatedByType, CrosswordDocument } from './crossword.model';
import { CrosswordDetailResponseDto } from './model/crossword.model';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { UserRole } from '../auth/auth.model';
import {
  parseSort,
  PlainToInstance,
  PlainToInstanceArray,
} from '../../utils/function.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginationResult } from '../../interfaces/pagination-result.interface';
import { AuthRequest } from '../../interfaces/auth.interface';

@ApiTags('crosswords')
@Controller('crosswords')
export class CrosswordController {
  constructor(private readonly crosswordService: CrosswordService) {}

  // Public endpoints for admin
  @Get('admin')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all crosswords with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of all crosswords',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAllForAdmin(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginationResult<CrosswordDetailResponseDto>> {
    const { items, page, limit, total, totalPages } =
      await this.crosswordService.findAll({
        page: query.page,
        limit: query.limit,
        sort: query.sort ? parseSort(query.sort) : undefined,
      });

    const newItems = PlainToInstanceArray(CrosswordDetailResponseDto, items);
    return { items: newItems, page, limit, total, totalPages };
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Get crossword detail by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Crossword ID' })
  @ApiResponse({
    status: 200,
    description: 'Crossword found',
    type: CrosswordDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Crossword not found' })
  async findOneForAdmin(
    @Param('id') id: string,
  ): Promise<CrosswordDetailResponseDto> {
    const crossword = await this.crosswordService.findOneWithDetails(id);
    return PlainToInstance(CrosswordDetailResponseDto, crossword);
  }

  @Post('admin')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new crossword (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Crossword created successfully',
    type: CrosswordDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createForAdmin(
    @Req() req: AuthRequest,
    @Body() createCrosswordDto: CreateCrosswordDto,
  ): Promise<CrosswordDetailResponseDto> {
    const crossword = await this.crosswordService.createCrossword(
      createCrosswordDto,
      CreatedByType.Admin,
      req.user,
    );
    return PlainToInstance(CrosswordDetailResponseDto, crossword);
  }

  @Put('admin/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update crossword (Admin only)' })
  @ApiParam({ name: 'id', description: 'Crossword ID' })
  @ApiResponse({
    status: 200,
    description: 'Crossword updated successfully',
    type: CrosswordDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Crossword not found' })
  async updateForAdmin(
    @Param('id') id: string,
    @Body() updateCrosswordDto: UpdateCrosswordDto,
  ): Promise<CrosswordDetailResponseDto> {
    const crossword = await this.crosswordService.updateCrossword(
      id,
      updateCrosswordDto,
    );
    return PlainToInstance(CrosswordDetailResponseDto, crossword);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete crossword (Admin only)' })
  @ApiParam({ name: 'id', description: 'Crossword ID' })
  @ApiResponse({
    status: 200,
    description: 'Crossword deleted successfully',
    type: CrosswordDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Crossword not found' })
  async removeForAdmin(
    @Param('id') id: string,
  ): Promise<CrosswordDetailResponseDto> {
    const crossword = await this.crosswordService.deleteCrossword(id);
    return PlainToInstance(CrosswordDetailResponseDto, crossword);
  }

  // Public endpoints for users
  @Get()
  @ApiOperation({ summary: 'Get all active crosswords with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of active crosswords',
  })
  async findAll(
    @Query() query: QueryCrosswordDto,
  ): Promise<PaginationResult<CrosswordDetailResponseDto>> {
    const filter: FilterQuery<CrosswordDocument> = {
      isActive: true,
    };

    if (query.hashtagId) {
      filter.hashtags = { $in: [new Types.ObjectId(query.hashtagId)] };
    }

    if (query.title) {
      filter.title = { $regex: query.title, $options: 'i' };
    }

    const { items, page, limit, total, totalPages } =
      await this.crosswordService.findAll({
        page: query.page,
        limit: query.limit,
        sort: query.sort ? parseSort(query.sort) : undefined,
        filter: filter,
        populate: 'hashtags',
      });
    const newItems = PlainToInstanceArray(CrosswordDetailResponseDto, items);
    return { items: newItems, page, limit, total, totalPages };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get crossword detail by ID' })
  @ApiParam({ name: 'id', description: 'Crossword ID' })
  @ApiResponse({
    status: 200,
    description: 'Crossword found',
    type: CrosswordDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Crossword not found' })
  async findOneForUser(
    @Param('id') id: string,
  ): Promise<CrosswordDetailResponseDto> {
    const crossword = await this.crosswordService.findOneWithDetails(id);
    return PlainToInstance(CrosswordDetailResponseDto, crossword);
  }

  @Post('')
  @ApiOperation({ summary: 'Create a new crossword (Community)' })
  @ApiResponse({
    status: 201,
    description: 'Crossword created successfully',
    type: CrosswordDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createForUser(
    @Req() req: AuthRequest,
    @Body() createCrosswordDto: CreateCrosswordDto,
  ): Promise<CrosswordDetailResponseDto> {
    const crossword = await this.crosswordService.createCrossword(
      createCrosswordDto,
      CreatedByType.Community,
      req.user,
    );
    return PlainToInstance(CrosswordDetailResponseDto, crossword);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar crosswords based on hashtags' })
  @ApiParam({ name: 'id', description: 'Crossword ID' })
  @ApiResponse({
    status: 200,
    description: 'List of similar crosswords',
    type: [CrosswordDetailResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Crossword not found' })
  async findSimilar(
    @Param('id') id: string,
  ): Promise<CrosswordDetailResponseDto[]> {
    const similarCrosswords = await this.crosswordService.findSimilar(id, 5);
    return PlainToInstanceArray(
      CrosswordDetailResponseDto,
      similarCrosswords || [],
    );
  }

  @Post('generate-from-openai')
  // @UseGuards(AuthGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate hashtags from OpenAI categories (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Hashtags generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async generateFromOpenAI(): Promise<{
    message: string;
    hashtagsCreated: number;
    hashtagsSkipped: number;
    crosswordsCreated: number;
    crosswordsFailed: number;
  }> {
    return await this.crosswordService.generateFromOpenAI();
  }

  @Post('generate')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate crosswords from custom category and topics (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Crosswords generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async generateCrosswords(@Body() dto: GenerateCrosswordDto): Promise<{
    message: string;
    hashtagsCreated: number;
    hashtagsSkipped: number;
    crosswordsCreated: number;
    crosswordsFailed: number;
  }> {
    return await this.crosswordService.generateCrosswords(dto);
  }
}
