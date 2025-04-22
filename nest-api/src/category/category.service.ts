import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Créer une catégorie associée à un utilisateur
  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: {
          userId,
          name: createCategoryDto.name,
          type: createCategoryDto.type,
        },
      });

      return category;
    } catch (error) {
      console.error('Error creating category', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  // Lister les catégories d'un utilisateur
  async findAllByUser(userId: string) {
    try {
      const categories = await this.prisma.category.findMany({
        where: {
          userId,
        },
      });

      return categories;
    } catch (error) {
      console.error('Error finding categories', error);
      throw new InternalServerErrorException('Failed to find categories');
    }
  }

  // Obtenir les détails d'une catégorie spécifique
  async findOne(id: string, userId: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Vérifier que la catégorie appartient à l'utilisateur
      if (category.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }

      return category;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error finding category', error);
      throw new InternalServerErrorException('Failed to find category');
    }
  }

  // Mettre à jour une catégorie
  async update(
    id: string,
    userId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      // Vérifier que la catégorie existe et appartient à l'utilisateur
      await this.findOne(id, userId);

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          ...(updateCategoryDto.name && { name: updateCategoryDto.name }),
          ...(updateCategoryDto.type && { type: updateCategoryDto.type }),
        },
      });

      return updatedCategory;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error updating category', error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  // Supprimer une catégorie
  async remove(id: string, userId: string) {
    try {
      // Vérifier que la catégorie existe et appartient à l'utilisateur
      await this.findOne(id, userId);

      // Vérifier si des transactions utilisent cette catégorie
      const transactionsCount = await this.prisma.transaction.count({
        where: { categoryId: id },
      });

      if (transactionsCount > 0) {
        throw new ForbiddenException(
          'Cannot delete category with associated transactions',
        );
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return { message: 'Category successfully deleted' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error deleting category', error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
