import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  // Créer un compte associé à un utilisateur
  async create(userId: string, createAccountDto: CreateAccountDto) {
    try {
      const account = await this.prisma.account.create({
        data: {
          userId,
          name: createAccountDto.name,
          type: createAccountDto.type,
          balance: createAccountDto.balance,
          currency: createAccountDto.currency,
        },
      });

      return account;
    } catch (error) {
      console.error('Error creating account', error);
      throw new InternalServerErrorException('Failed to create account');
    }
  }

  // Lister les comptes d'un utilisateur
  async findAllByUser(userId: string) {
    try {
      const accounts = await this.prisma.account.findMany({
        where: {
          userId,
        },
      });

      return accounts;
    } catch (error) {
      console.error('Error finding accounts', error);
      throw new InternalServerErrorException('Failed to find accounts');
    }
  }

  // Obtenir les détails d'un compte spécifique
  async findOne(id: string, userId: string) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Vérifier que le compte appartient à l'utilisateur
      if (account.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }

      return account;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error finding account', error);
      throw new InternalServerErrorException('Failed to find account');
    }
  }

  // Mettre à jour un compte
  async update(id: string, userId: string, updateAccountDto: UpdateAccountDto) {
    try {
      // Vérifier que le compte existe et appartient à l'utilisateur
      await this.findOne(id, userId);

      const updatedAccount = await this.prisma.account.update({
        where: { id },
        data: {
          ...(updateAccountDto.name && { name: updateAccountDto.name }),
          ...(updateAccountDto.type && { type: updateAccountDto.type }),
          ...(updateAccountDto.balance && {
            balance: updateAccountDto.balance,
          }),
          ...(updateAccountDto.currency && {
            currency: updateAccountDto.currency,
          }),
        },
      });

      return updatedAccount;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error updating account', error);
      throw new InternalServerErrorException('Failed to update account');
    }
  }

  // Supprimer un compte
  async remove(id: string, userId: string) {
    try {
      // Vérifier que le compte existe et appartient à l'utilisateur
      await this.findOne(id, userId);

      await this.prisma.account.delete({
        where: { id },
      });

      return { message: 'Account successfully deleted' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error deleting account', error);
      throw new InternalServerErrorException('Failed to delete account');
    }
  }
}
