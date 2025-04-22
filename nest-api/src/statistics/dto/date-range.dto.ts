import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({
    example: '2023-01-01',
    description: 'Date de début (format YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2023-12-31',
    description: 'Date de fin (format YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
