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
import { DestinataireService } from './destinataire.service';
import { CreateDestinataireDto } from './dto/create-destinataire.dto';
import { UpdateDestinataireDto } from './dto/update-destinataire.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('destinataires')
@ApiBearerAuth()
@Controller('destinataires')
@UseGuards(JwtAuthGuard)
export class DestinataireController {
  constructor(private readonly destinataireService: DestinataireService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau destinataire' })
  @ApiResponse({ status: 201, description: 'Destinataire créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Request() req, @Body() createDestinataireDto: CreateDestinataireDto) {
    return this.destinataireService.create(
      req.user.userId,
      createDestinataireDto,
    );
  }

  @Get()
  @ApiOperation({ summary: "Lister tous les destinataires de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Liste des destinataires' })
  findAll(@Request() req) {
    return this.destinataireService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un destinataire par son ID' })
  @ApiResponse({ status: 200, description: 'Destinataire trouvé' })
  @ApiResponse({ status: 404, description: 'Destinataire non trouvé' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.destinataireService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un destinataire' })
  @ApiResponse({ status: 200, description: 'Destinataire mis à jour' })
  @ApiResponse({ status: 404, description: 'Destinataire non trouvé' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDestinataireDto: UpdateDestinataireDto,
  ) {
    return this.destinataireService.update(
      id,
      req.user.userId,
      updateDestinataireDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un destinataire' })
  @ApiResponse({ status: 200, description: 'Destinataire supprimé' })
  @ApiResponse({ status: 404, description: 'Destinataire non trouvé' })
  remove(@Param('id') id: string, @Request() req) {
    return this.destinataireService.remove(id, req.user.userId);
  }
}
