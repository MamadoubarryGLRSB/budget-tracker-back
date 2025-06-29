import {
  IsNotEmpty,
  IsString,
  IsDecimal,
  IsDateString,
  IsIn,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID du compte',
  })
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID de la catégorie',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'ID du recipient (optionnel)',
  })
  @IsUUID()
  @IsOptional()
  recipientId?: string;

  @ApiProperty({
    example: '2023-04-15T00:00:00Z',
    description: 'Date de la transaction',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    example: 'Courses au supermarché',
    description: 'Description de la transaction',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '45.99', description: 'Montant de la transaction' })
  @IsDecimal()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    example: 'expense',
    description: 'Type de transaction (income, expense)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['income', 'expense'])
  type: string;
}
