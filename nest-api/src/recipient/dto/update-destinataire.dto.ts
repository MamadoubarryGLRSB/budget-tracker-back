import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipientDto } from './create-destinataire.dto';

export class UpdateRecipientDto extends PartialType(CreateRecipientDto) {}
