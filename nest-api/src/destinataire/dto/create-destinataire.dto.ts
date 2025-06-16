import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDestinataireDto {
  @ApiProperty({
    example: 'Carrefour',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
