import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
}
