import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDestinataireDto } from './dto/create-destinataire.dto';
import { UpdateDestinataireDto } from './dto/update-destinataire.dto';

@Injectable()
export class DestinataireService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(userId: string, createDestinataireDto: CreateDestinataireDto) {
    return this.prisma.destinataire.create({
      data: {
        ...createDestinataireDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.destinataire.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const destinataire = await this.prisma.destinataire.findFirst({
      where: { id, userId },
    });

    if (!destinataire) {
      throw new NotFoundException('Destinataire not found');
    }

    return destinataire;
  }

  async update(
    id: string,
    userId: string,
    updateDestinataireDto: UpdateDestinataireDto,
  ) {
    await this.findOne(id, userId); // Vérifier que le destinataire existe et appartient à l'utilisateur

    return this.prisma.destinataire.update({
      where: { id },
      data: updateDestinataireDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Vérifier que le destinataire existe et appartient à l'utilisateur

    return this.prisma.destinataire.delete({
      where: { id },
    });
  }
}
