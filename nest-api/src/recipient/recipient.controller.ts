import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RecipientService } from './recipient.service';
import { CreateRecipientDto } from './dto/create-destinataire.dto';
import { UpdateRecipientDto } from './dto/update-destinataire.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('recipients')
@ApiBearerAuth()
@Controller('recipients')
@UseGuards(JwtAuthGuard)
export class RecipientController {
  constructor(private readonly recipientService: RecipientService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau recipient' })
  @ApiResponse({ status: 201, description: 'Recipient créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Request() req, @Body() createRecipientDto: CreateRecipientDto) {
    return this.recipientService.create(req.user.userId, createRecipientDto);
  }

  @Get()
  @ApiOperation({ summary: "Lister tous les recipients de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Liste des recipients' })
  findAll(@Request() req) {
    return this.recipientService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un recipient par son ID' })
  @ApiResponse({ status: 200, description: 'Recipient trouvé' })
  @ApiResponse({ status: 404, description: 'Recipient non trouvé' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.recipientService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un recipient' })
  @ApiResponse({ status: 200, description: 'Recipient mis à jour' })
  @ApiResponse({ status: 404, description: 'Recipient non trouvé' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateRecipientDto: UpdateRecipientDto,
  ) {
    return this.recipientService.update(
      id,
      req.user.userId,
      updateRecipientDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un recipient' })
  @ApiResponse({ status: 200, description: 'Recipient supprimé' })
  @ApiResponse({ status: 404, description: 'Recipient non trouvé' })
  remove(@Param('id') id: string, @Request() req) {
    return this.recipientService.remove(id, req.user.userId);
  }
}
