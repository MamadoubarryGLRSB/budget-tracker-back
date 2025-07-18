import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipientDto } from './dto/create-destinataire.dto';
import { UpdateRecipientDto } from './dto/update-destinataire.dto';

@Injectable()
export class RecipientService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createRecipientDto: CreateRecipientDto) {
    return this.prisma.recipient.create({
      data: {
        ...createRecipientDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.recipient.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const recipient = await this.prisma.recipient.findFirst({
      where: { id, userId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    return recipient;
  }

  async update(
    id: string,
    userId: string,
    updateRecipientDto: UpdateRecipientDto,
  ) {
    await this.findOne(id, userId); // Vérifier que le recipient existe et appartient à l'utilisateur

    return this.prisma.recipient.update({
      where: { id },
      data: updateRecipientDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Vérifier que le recipient existe et appartient à l'utilisateur

    return this.prisma.recipient.delete({
      where: { id },
    });
  }
}
