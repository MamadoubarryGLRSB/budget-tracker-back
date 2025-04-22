import { IsNotEmpty, IsString, IsDecimal, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 'Compte courant', description: 'Nom du compte' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'bank',
    description: 'Type de compte (bank, cash, credit, investment)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['bank', 'cash', 'credit', 'investment'])
  type: string;

  @ApiProperty({ example: '1000.00', description: 'Solde initial du compte' })
  @IsDecimal()
  @IsNotEmpty()
  balance: string;

  @ApiProperty({ example: 'EUR', description: 'Devise du compte' })
  @IsString()
  @IsNotEmpty()
  currency: string;
}
