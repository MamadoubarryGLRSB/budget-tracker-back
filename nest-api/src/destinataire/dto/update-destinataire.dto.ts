import { PartialType } from '@nestjs/mapped-types';
import { CreateDestinataireDto } from './create-destinataire.dto';

export class UpdateDestinataireDto extends PartialType(CreateDestinataireDto) {}
