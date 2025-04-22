import {
  IsOptional,
  IsString,
  IsDecimal,
  IsDateString,
  IsIn,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID du compte',
  })
  @IsUUID()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID de la catégorie',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    example: '2023-04-15T00:00:00Z',
    description: 'Date de la transaction',
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    example: 'Courses au supermarché',
    description: 'Description de la transaction',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '45.99',
    description: 'Montant de la transaction',
  })
  @IsDecimal()
  @IsOptional()
  amount?: string;

  @ApiPropertyOptional({
    example: 'expense',
    description: 'Type de transaction (income, expense)',
  })
  @IsString()
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: string;
}
