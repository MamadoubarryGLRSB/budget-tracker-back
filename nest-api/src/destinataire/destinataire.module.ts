import { Module } from '@nestjs/common';
import { DestinataireService } from './destinataire.service';
import { DestinataireController } from './destinataire.controller';

@Module({
  controllers: [DestinataireController],
  providers: [DestinataireService],
  exports: [DestinataireService],
})
export class DestinataireModule {}
