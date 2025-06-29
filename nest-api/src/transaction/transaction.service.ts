import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Créer une transaction
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    try {
      // Vérifier que le compte existe et appartient à l'utilisateur
      const account = await this.prisma.account.findUnique({
        where: { id: createTransactionDto.accountId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (account.userId !== userId) {
        throw new ForbiddenException('Access to account denied');
      }

      // Vérifier que la catégorie existe et appartient à l'utilisateur
      const category = await this.prisma.category.findUnique({
        where: { id: createTransactionDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.userId !== userId) {
        throw new ForbiddenException('Access to category denied');
      }

      // Vérifier le recipient s'il est fourni
      if (createTransactionDto.recipientId) {
        const recipient = await this.prisma.recipient.findUnique({
          where: { id: createTransactionDto.recipientId },
        });

        if (!recipient) {
          throw new NotFoundException('Recipient not found');
        }

        if (recipient.userId !== userId) {
          throw new ForbiddenException('Access to recipient denied');
        }
      }

      // Calculer le nouveau solde du compte
      let newBalance: Prisma.Decimal;
      const transactionAmount = new Prisma.Decimal(createTransactionDto.amount);

      if (createTransactionDto.type === 'income') {
        newBalance = account.balance.add(transactionAmount);
      } else {
        newBalance = account.balance.sub(transactionAmount);
      }

      // Utiliser une transaction Prisma pour garantir l'atomicité
      const result = await this.prisma.$transaction([
        // Créer la transaction
        this.prisma.transaction.create({
          data: {
            userId,
            accountId: createTransactionDto.accountId,
            categoryId: createTransactionDto.categoryId,
            recipientId: createTransactionDto.recipientId,
            date: new Date(createTransactionDto.date),
            description: createTransactionDto.description,
            amount: transactionAmount,
            type: createTransactionDto.type,
          },
        }),
        // Mettre à jour le solde du compte
        this.prisma.account.update({
          where: { id: createTransactionDto.accountId },
          data: { balance: newBalance },
        }),
      ]);

      return result[0]; // Retourner la transaction créée
    } catch (error) {
      console.error('Error creating transaction', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  // Lister les transactions d'un utilisateur
  async findAllByUser(userId: string) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: 'desc',
        },
        include: {
          recipient: {
            select: {
              name: true,
            },
          },
        },
      });

      return transactions;
    } catch (error) {
      console.error('Error finding transactions', error);
      throw new InternalServerErrorException('Failed to find transactions');
    }
  }

  // Obtenir les détails d'une transaction spécifique
  async findOne(id: string, userId: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          recipient: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Vérifier que la transaction appartient à l'utilisateur
      if (transaction.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }

      return transaction;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error finding transaction', error);
      throw new InternalServerErrorException('Failed to find transaction');
    }
  }

  // Mettre à jour une transaction
  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    try {
      // Récupérer la transaction actuelle
      const currentTransaction = await this.prisma.transaction.findUnique({
        where: { id },
      });

      if (!currentTransaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (currentTransaction.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }

      // Récupérer le compte actuel
      const currentAccount = await this.prisma.account.findUnique({
        where: { id: currentTransaction.accountId },
      });

      if (!currentAccount) {
        throw new NotFoundException('Account not found');
      }

      // Variables pour la mise à jour
      let accountToUpdate = currentTransaction.accountId;
      let categoryToUpdate = currentTransaction.categoryId;
      let amountToUpdate = currentTransaction.amount;
      let typeToUpdate = currentTransaction.type;

      // Vérifications si le compte est modifié
      if (
        updateTransactionDto.accountId &&
        updateTransactionDto.accountId !== currentTransaction.accountId
      ) {
        const newAccount = await this.prisma.account.findUnique({
          where: { id: updateTransactionDto.accountId },
        });

        if (!newAccount) {
          throw new NotFoundException('New account not found');
        }

        if (newAccount.userId !== userId) {
          throw new ForbiddenException('Access to new account denied');
        }

        accountToUpdate = updateTransactionDto.accountId;
      }

      // Vérifications si la catégorie est modifiée
      if (
        updateTransactionDto.categoryId &&
        updateTransactionDto.categoryId !== currentTransaction.categoryId
      ) {
        const newCategory = await this.prisma.category.findUnique({
          where: { id: updateTransactionDto.categoryId },
        });

        if (!newCategory) {
          throw new NotFoundException('New category not found');
        }

        if (newCategory.userId !== userId) {
          throw new ForbiddenException('Access to new category denied');
        }

        categoryToUpdate = updateTransactionDto.categoryId;
      }

      // Mise à jour du montant
      if (updateTransactionDto.amount) {
        amountToUpdate = new Prisma.Decimal(updateTransactionDto.amount);
      }

      // Mise à jour du type
      if (updateTransactionDto.type) {
        typeToUpdate = updateTransactionDto.type;
      }

      // Calculer les ajustements de solde pour les comptes
      // 1. Annuler l'effet de la transaction actuelle sur le compte actuel
      let currentAccountNewBalance = currentAccount.balance;
      if (currentTransaction.type === 'income') {
        currentAccountNewBalance = currentAccountNewBalance.sub(
          currentTransaction.amount,
        );
      } else {
        currentAccountNewBalance = currentAccountNewBalance.add(
          currentTransaction.amount,
        );
      }

      // 2. Appliquer l'effet de la nouvelle transaction
      const updateOperations = [];

      // Mise à jour de la transaction
      updateOperations.push(
        this.prisma.transaction.update({
          where: { id },
          data: {
            ...(updateTransactionDto.accountId && {
              accountId: updateTransactionDto.accountId,
            }),
            categoryId: categoryToUpdate,
            ...(updateTransactionDto.date && {
              date: new Date(updateTransactionDto.date),
            }),
            ...(updateTransactionDto.description !== undefined && {
              description: updateTransactionDto.description,
            }),
            ...(updateTransactionDto.amount && { amount: amountToUpdate }),
            ...(updateTransactionDto.type && {
              type: updateTransactionDto.type,
            }),
          },
        }),
      );

      // Mise à jour du solde du compte actuel
      updateOperations.push(
        this.prisma.account.update({
          where: { id: currentTransaction.accountId },
          data: { balance: currentAccountNewBalance },
        }),
      );

      // 3. Si le compte a changé, mettre à jour le nouveau compte
      if (accountToUpdate !== currentTransaction.accountId) {
        const newAccount = await this.prisma.account.findUnique({
          where: { id: accountToUpdate },
        });

        let newAccountNewBalance = newAccount.balance;
        if (typeToUpdate === 'income') {
          newAccountNewBalance = newAccountNewBalance.add(amountToUpdate);
        } else {
          newAccountNewBalance = newAccountNewBalance.sub(amountToUpdate);
        }

        updateOperations.push(
          this.prisma.account.update({
            where: { id: accountToUpdate },
            data: { balance: newAccountNewBalance },
          }),
        );
      } else {
        // Si c'est le même compte, appliquer l'effet de la nouvelle transaction
        if (typeToUpdate === 'income') {
          currentAccountNewBalance =
            currentAccountNewBalance.add(amountToUpdate);
        } else {
          currentAccountNewBalance =
            currentAccountNewBalance.sub(amountToUpdate);
        }

        // Mettre à jour le solde du compte avec la nouvelle valeur
        updateOperations[1] = this.prisma.account.update({
          where: { id: currentTransaction.accountId },
          data: { balance: currentAccountNewBalance },
        });
      }

      // Exécuter toutes les mises à jour dans une transaction
      const result = await this.prisma.$transaction(updateOperations);

      return result[0]; // Retourner la transaction mise à jour
    } catch (error) {
      console.error('Error updating transaction', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update transaction');
    }
  }

  // Supprimer une transaction
  async remove(id: string, userId: string) {
    try {
      // Récupérer la transaction à supprimer
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (transaction.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }

      // Récupérer le compte associé
      const account = await this.prisma.account.findUnique({
        where: { id: transaction.accountId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Calculer le nouveau solde du compte
      let newBalance: Prisma.Decimal;
      if (transaction.type === 'income') {
        newBalance = account.balance.sub(transaction.amount);
      } else {
        newBalance = account.balance.add(transaction.amount);
      }

      // Utiliser une transaction Prisma pour garantir l'atomicité
      await this.prisma.$transaction([
        // Supprimer la transaction
        this.prisma.transaction.delete({
          where: { id },
        }),
        // Mettre à jour le solde du compte
        this.prisma.account.update({
          where: { id: transaction.accountId },
          data: { balance: newBalance },
        }),
      ]);

      return { message: 'Transaction successfully deleted' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error deleting transaction', error);
      throw new InternalServerErrorException('Failed to delete transaction');
    }
  }
}
