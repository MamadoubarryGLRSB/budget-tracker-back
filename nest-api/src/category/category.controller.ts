import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('categories')
@Controller('categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user,
  ) {
    return this.categoryService.create(user.userId, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the current user' })
  @ApiResponse({ status: 200, description: 'Return all categories' })
  async findAll(@CurrentUser() user) {
    return this.categoryService.findAllByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category details' })
  @ApiResponse({ status: 200, description: 'Return the category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.categoryService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category successfully updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user,
  ) {
    return this.categoryService.update(id, user.userId, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category successfully deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @CurrentUser() user) {
    return this.categoryService.remove(id, user.userId);
  }
}
