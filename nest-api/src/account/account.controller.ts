// src/account/account.controller.ts
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
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccountService } from './acount.service';

@ApiTags('accounts')
@Controller('accounts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser() user,
  ) {
    return this.accountService.create(user.userId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts for the current user' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  async findAll(@CurrentUser() user) {
    return this.accountService.findAllByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account details' })
  @ApiResponse({ status: 200, description: 'Return the account details' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.accountService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'Account successfully updated' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user,
  ) {
    return this.accountService.update(id, user.userId, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 200, description: 'Account successfully deleted' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @CurrentUser() user) {
    return this.accountService.remove(id, user.userId);
  }
}
