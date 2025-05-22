import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Nourriture',
    description: 'Nom de la catégorie',
  })
  @IsString()
  @IsOptional()
  name?: string;
}
