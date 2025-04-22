import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Nourriture',
    description: 'Nom de la catégorie',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'expense',
    description: 'Type de catégorie (income, expense)',
  })
  @IsString()
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: string;
}
