import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DateRangeDto } from './dto/date-range.dto';
import { YearDto } from './dto/year.dto';

@ApiTags('statistics')
@Controller('statistics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Get expenses by category for a date range' })
  @ApiResponse({
    status: 200,
    description: 'Return expenses grouped by category',
  })
  async getExpensesByCategory(
    @Query() dateRange: DateRangeDto,
    @CurrentUser() user,
  ) {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    return this.statisticsService.getExpensesByCategory(
      user.userId,
      startDate,
      endDate,
    );
  }

  @Get('incomes-by-category')
  @ApiOperation({ summary: 'Get incomes by category for a date range' })
  @ApiResponse({
    status: 200,
    description: 'Return incomes grouped by category',
  })
  async getIncomesByCategory(
    @Query() dateRange: DateRangeDto,
    @CurrentUser() user,
  ) {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    return this.statisticsService.getIncomesByCategory(
      user.userId,
      startDate,
      endDate,
    );
  }

  @Get('monthly-balance')
  @ApiOperation({
    summary: 'Get monthly expenses, incomes and balance for a year',
  })
  @ApiResponse({ status: 200, description: 'Return monthly financial data' })
  async getMonthlyBalance(@Query() yearDto: YearDto, @CurrentUser() user) {
    return this.statisticsService.getMonthlyBalance(user.userId, yearDto.year);
  }

  @Get('expenses-by-account')
  @ApiOperation({ summary: 'Get expenses by account for a date range' })
  @ApiResponse({
    status: 200,
    description: 'Return expenses grouped by account',
  })
  async getExpensesByAccount(
    @Query() dateRange: DateRangeDto,
    @CurrentUser() user,
  ) {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    return this.statisticsService.getExpensesByAccount(
      user.userId,
      startDate,
      endDate,
    );
  }

  @Get('annual-summary')
  @ApiOperation({ summary: 'Get annual financial summary' })
  @ApiResponse({ status: 200, description: 'Return annual financial summary' })
  async getAnnualSummary(@Query() yearDto: YearDto, @CurrentUser() user) {
    return this.statisticsService.getAnnualSummary(user.userId, yearDto.year);
  }

  @Get('account/:id?')
  @ApiOperation({ summary: 'Get transaction statistics by savings account' })
  @ApiParam({
    name: 'id',
    required: false,
    description: 'Account ID (optional, if not provided then all accounts)',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (YYYY-MM-DD format)',
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (YYYY-MM-DD format)',
    example: '2023-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Return transaction statistics for specified account or all accounts',
  })
  async getAccountStatistics(
    @Param('id') accountId: string | undefined,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Gérer le cas où l'ID n'est pas fourni ou est une chaîne vide
    const finalAccountId = accountId && accountId !== 'undefined' && accountId !== '{id}' ? accountId : undefined;
    
    return this.statisticsService.getAccountStatistics(
      user.userId,
      finalAccountId,
      start,
      end,
    );
  }

  @Get('account')
  @ApiOperation({ summary: 'Get transaction statistics for all accounts' })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (YYYY-MM-DD format)',
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (YYYY-MM-DD format)',
    example: '2023-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Return transaction statistics for all accounts',
  })
  async getAllAccountsStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.statisticsService.getAccountStatistics(
      user.userId,
      undefined,
      start,
      end,
    );
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get transaction statistics by category' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Category ID (required)',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (YYYY-MM-DD format)',
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (YYYY-MM-DD format)',
    example: '2023-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Return transaction statistics for specified category',
  })
  async getCategoryStatistics(
    @Param('id') categoryId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.statisticsService.getCategoryStatistics(
      user.userId,
      categoryId,
      start,
      end,
    );
  }

  @Get('recipient/:id')
  @ApiOperation({ summary: 'Get transaction statistics by recipient' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Recipient ID (required)',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (YYYY-MM-DD format)',
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (YYYY-MM-DD format)',
    example: '2023-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Return transaction statistics for specified recipient',
  })
  async getRecipientStatistics(
    @Param('id') recipientId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.statisticsService.getRecipientStatistics(
      user.userId,
      recipientId,
      start,
      end,
    );
  }
}
