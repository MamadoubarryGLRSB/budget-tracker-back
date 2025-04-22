import { IsOptional, IsString, IsDecimal, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    example: 'Compte courant',
    description: 'Nom du compte',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'bank',
    description: 'Type de compte (bank, cash, credit, investment)',
  })
  @IsString()
  @IsOptional()
  @IsIn(['bank', 'cash', 'credit', 'investment'])
  type?: string;

  @ApiPropertyOptional({ example: '1000.00', description: 'Solde du compte' })
  @IsDecimal()
  @IsOptional()
  balance?: string;

  @ApiPropertyOptional({ example: 'EUR', description: 'Devise du compte' })
  @IsString()
  @IsOptional()
  currency?: string;
}
