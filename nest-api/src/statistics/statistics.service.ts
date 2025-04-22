import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StatisticsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Obtenir les dépenses par catégorie pour une période donnée
  async getExpensesByCategory(userId: string, startDate: Date, endDate: Date) {
    try {
      const expenses = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'expense',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Récupérer les noms des catégories
      const categoriesWithNames = await Promise.all(
        expenses.map(async (expense) => {
          const category = await this.prisma.category.findUnique({
            where: { id: expense.categoryId },
            select: { name: true },
          });

          return {
            categoryId: expense.categoryId,
            categoryName: category.name,
            amount: expense._sum.amount,
          };
        }),
      );

      return categoriesWithNames;
    } catch (error) {
      console.error('Error getting expenses by category', error);
      throw new InternalServerErrorException(
        'Failed to get expenses by category',
      );
    }
  }

  // Obtenir les revenus par catégorie pour une période donnée
  async getIncomesByCategory(userId: string, startDate: Date, endDate: Date) {
    try {
      const incomes = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'income',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Récupérer les noms des catégories
      const categoriesWithNames = await Promise.all(
        incomes.map(async (income) => {
          const category = await this.prisma.category.findUnique({
            where: { id: income.categoryId },
            select: { name: true },
          });

          return {
            categoryId: income.categoryId,
            categoryName: category.name,
            amount: income._sum.amount,
          };
        }),
      );

      return categoriesWithNames;
    } catch (error) {
      console.error('Error getting incomes by category', error);
      throw new InternalServerErrorException(
        'Failed to get incomes by category',
      );
    }
  }

  // Obtenir les dépenses et revenus mensuels
  async getMonthlyBalance(userId: string, year: number) {
    try {
      // Construire un tableau de mois
      const months = Array.from({ length: 12 }, (_, i) => i + 1);

      // Récupérer les données pour chaque mois
      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);

          // Obtenir les dépenses du mois
          const expenses = await this.prisma.transaction.aggregate({
            _sum: {
              amount: true,
            },
            where: {
              userId,
              type: 'expense',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          });

          // Obtenir les revenus du mois
          const incomes = await this.prisma.transaction.aggregate({
            _sum: {
              amount: true,
            },
            where: {
              userId,
              type: 'income',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          });

          return {
            month,
            expenses: expenses._sum.amount ? Number(expenses._sum.amount) : 0,
            incomes: incomes._sum.amount ? Number(incomes._sum.amount) : 0,
            balance:
              Number(incomes._sum.amount || 0) -
              Number(expenses._sum.amount || 0),
          };
        }),
      );

      return monthlyData;
    } catch (error) {
      console.error('Error getting monthly balance', error);
      throw new InternalServerErrorException('Failed to get monthly balance');
    }
  }

  // Obtenir les dépenses par compte
  async getExpensesByAccount(userId: string, startDate: Date, endDate: Date) {
    try {
      const expenses = await this.prisma.transaction.groupBy({
        by: ['accountId'],
        where: {
          userId,
          type: 'expense',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Récupérer les noms des comptes
      const accountsWithNames = await Promise.all(
        expenses.map(async (expense) => {
          const account = await this.prisma.account.findUnique({
            where: { id: expense.accountId },
            select: { name: true, currency: true },
          });

          return {
            accountId: expense.accountId,
            accountName: account.name,
            currency: account.currency,
            amount: expense._sum.amount,
          };
        }),
      );

      return accountsWithNames;
    } catch (error) {
      console.error('Error getting expenses by account', error);
      throw new InternalServerErrorException(
        'Failed to get expenses by account',
      );
    }
  }

  // Obtenir le résumé des dépenses sur plusieurs périodes (pour comparaison)
  async getExpensesTrends(
    userId: string,
    periods: { startDate: Date; endDate: Date }[],
  ) {
    try {
      const trends = await Promise.all(
        periods.map(async (period, index) => {
          const expenses = await this.prisma.transaction.aggregate({
            _sum: {
              amount: true,
            },
            where: {
              userId,
              type: 'expense',
              date: {
                gte: period.startDate,
                lte: period.endDate,
              },
            },
          });

          return {
            periodIndex: index,
            startDate: period.startDate,
            endDate: period.endDate,
            totalExpenses: expenses._sum.amount || 0,
          };
        }),
      );

      return trends;
    } catch (error) {
      console.error('Error getting expense trends', error);
      throw new InternalServerErrorException('Failed to get expense trends');
    }
  }

  // Obtenir le bilan annuel
  async getAnnualSummary(userId: string, year: number) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      // Dépenses totales
      const totalExpenses = await this.prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId,
          type: 'expense',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Revenus totaux
      const totalIncomes = await this.prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId,
          type: 'income',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Top 5 des catégories de dépenses
      const topExpenseCategories = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'expense',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 5,
      });

      // Récupérer les noms des catégories
      const topCategoriesWithNames = await Promise.all(
        topExpenseCategories.map(async (category) => {
          const categoryInfo = await this.prisma.category.findUnique({
            where: { id: category.categoryId },
            select: { name: true },
          });

          return {
            categoryId: category.categoryId,
            categoryName: categoryInfo.name,
            amount: category._sum.amount,
          };
        }),
      );

      return {
        year,
        totalExpenses: totalExpenses._sum.amount
          ? Number(totalExpenses._sum.amount)
          : 0,
        totalIncomes: totalIncomes._sum.amount
          ? Number(totalIncomes._sum.amount)
          : 0,
        netSavings:
          Number(totalIncomes._sum.amount || 0) -
          Number(totalExpenses._sum.amount || 0),
        topExpenseCategories: topCategoriesWithNames,
      };
    } catch (error) {
      console.error('Error getting annual summary', error);
      throw new InternalServerErrorException('Failed to get annual summary');
    }
  }
}
