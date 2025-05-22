import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Nourriture', description: 'Nom de la catégorie' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
