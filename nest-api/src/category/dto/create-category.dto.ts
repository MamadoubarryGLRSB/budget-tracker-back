import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Nourriture', description: 'Nom de la catégorie' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'expense',
    description: 'Type de catégorie (income, expense)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['income', 'expense'])
  type: string;
}
