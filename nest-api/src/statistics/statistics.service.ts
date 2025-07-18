import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

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

  // Obtenir les statistiques des transactions par compte d'épargne
  async getAccountStatistics(
    userId: string,
    accountId: string | undefined,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      // Construire la condition where de base
      const whereCondition: any = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Ajouter la condition accountId si fournie
      if (accountId) {
        whereCondition.accountId = accountId;
      }

      // Récupérer les statistiques globales
      const totalTransactions = await this.prisma.transaction.count({
        where: whereCondition,
      });

      const totalExpenses = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...whereCondition, type: 'expense' },
      });

      const totalIncomes = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...whereCondition, type: 'income' },
      });

      // Statistiques par compte si aucun accountId spécifique n'est fourni
      let accountBreakdown = null;
      if (!accountId) {
        const accountStats = await this.prisma.transaction.groupBy({
          by: ['accountId'],
          where: whereCondition,
          _count: { _all: true },
          _sum: { amount: true },
        });

        accountBreakdown = await Promise.all(
          accountStats.map(async (stat) => {
            const account = await this.prisma.account.findUnique({
              where: { id: stat.accountId },
              select: { name: true, currency: true, type: true },
            });

            // Calculer les dépenses et revenus pour ce compte
            const accountExpenses = await this.prisma.transaction.aggregate({
              _sum: { amount: true },
              where: { ...whereCondition, accountId: stat.accountId, type: 'expense' },
            });

            const accountIncomes = await this.prisma.transaction.aggregate({
              _sum: { amount: true },
              where: { ...whereCondition, accountId: stat.accountId, type: 'income' },
            });

            return {
              accountId: stat.accountId,
              accountName: account?.name,
              accountType: account?.type,
              currency: account?.currency,
              totalTransactions: stat._count._all,
              totalExpenses: accountExpenses._sum.amount ? Number(accountExpenses._sum.amount) : 0,
              totalIncomes: accountIncomes._sum.amount ? Number(accountIncomes._sum.amount) : 0,
              netBalance: 
                (accountIncomes._sum.amount ? Number(accountIncomes._sum.amount) : 0) -
                (accountExpenses._sum.amount ? Number(accountExpenses._sum.amount) : 0),
            };
          }),
        );
      }

      // Statistiques par type de transaction
      const transactionsByType = await this.prisma.transaction.groupBy({
        by: ['type'],
        where: whereCondition,
        _count: { _all: true },
        _sum: { amount: true },
      });

      return {
        period: {
          startDate,
          endDate,
        },
        accountId: accountId || 'all',
        summary: {
          totalTransactions,
          totalExpenses: totalExpenses._sum.amount ? Number(totalExpenses._sum.amount) : 0,
          totalIncomes: totalIncomes._sum.amount ? Number(totalIncomes._sum.amount) : 0,
          netBalance: 
            (totalIncomes._sum.amount ? Number(totalIncomes._sum.amount) : 0) -
            (totalExpenses._sum.amount ? Number(totalExpenses._sum.amount) : 0),
        },
        transactionsByType: transactionsByType.map(stat => ({
          type: stat.type,
          count: stat._count._all,
          total: stat._sum.amount ? Number(stat._sum.amount) : 0,
        })),
        accountBreakdown,
      };
    } catch (error) {
      console.error('Error getting account statistics', error);
      throw new InternalServerErrorException('Failed to get account statistics');
    }
  }

  // Obtenir les statistiques des transactions par catégorie
  async getCategoryStatistics(
    userId: string,
    categoryId: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      // Vérifier que la catégorie existe et appartient à l'utilisateur
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true, userId: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.userId !== userId) {
        throw new ForbiddenException('Access to category denied');
      }

      // Construire la condition where
      const whereCondition = {
        userId,
        categoryId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Récupérer les statistiques globales
      const totalTransactions = await this.prisma.transaction.count({
        where: whereCondition,
      });

      const totalExpenses = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...whereCondition, type: 'expense' },
      });

      const totalIncomes = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...whereCondition, type: 'income' },
      });

      // Statistiques par type de transaction
      const transactionsByType = await this.prisma.transaction.groupBy({
        by: ['type'],
        where: whereCondition,
        _count: { _all: true },
        _sum: { amount: true },
      });

      // Répartition par compte pour cette catégorie
      const accountBreakdown = await this.prisma.transaction.groupBy({
        by: ['accountId'],
        where: whereCondition,
        _count: { _all: true },
        _sum: { amount: true },
      });

      const accountsWithDetails = await Promise.all(
        accountBreakdown.map(async (stat) => {
          const account = await this.prisma.account.findUnique({
            where: { id: stat.accountId },
            select: { name: true, currency: true, type: true },
          });

          // Calculer les dépenses et revenus pour ce compte dans cette catégorie
          const accountExpenses = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { ...whereCondition, accountId: stat.accountId, type: 'expense' },
          });

          const accountIncomes = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { ...whereCondition, accountId: stat.accountId, type: 'income' },
          });

          return {
            accountId: stat.accountId,
            accountName: account?.name,
            accountType: account?.type,
            currency: account?.currency,
            totalTransactions: stat._count._all,
            totalExpenses: accountExpenses._sum.amount ? Number(accountExpenses._sum.amount) : 0,
            totalIncomes: accountIncomes._sum.amount ? Number(accountIncomes._sum.amount) : 0,
            netBalance: 
              (accountIncomes._sum.amount ? Number(accountIncomes._sum.amount) : 0) -
              (accountExpenses._sum.amount ? Number(accountExpenses._sum.amount) : 0),
          };
        }),
      );

      // Statistiques mensuelles pour la période
      const monthlyStats = [];
      const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
      
      let currentMonth = new Date(startMonth);
      while (currentMonth <= endMonth) {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const monthlyExpenses = await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          _count: { _all: true },
          where: {
            ...whereCondition,
            type: 'expense',
            date: { gte: monthStart, lte: monthEnd },
          },
        });

        const monthlyIncomes = await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          _count: { _all: true },
          where: {
            ...whereCondition,
            type: 'income',
            date: { gte: monthStart, lte: monthEnd },
          },
        });

        monthlyStats.push({
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear(),
          expenses: {
            count: monthlyExpenses._count._all,
            total: monthlyExpenses._sum.amount ? Number(monthlyExpenses._sum.amount) : 0,
          },
          incomes: {
            count: monthlyIncomes._count._all,
            total: monthlyIncomes._sum.amount ? Number(monthlyIncomes._sum.amount) : 0,
          },
        });

        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      return {
        period: {
          startDate,
          endDate,
        },
        category: {
          id: categoryId,
          name: category.name,
        },
        summary: {
          totalTransactions,
          totalExpenses: totalExpenses._sum.amount ? Number(totalExpenses._sum.amount) : 0,
          totalIncomes: totalIncomes._sum.amount ? Number(totalIncomes._sum.amount) : 0,
          netBalance: 
            (totalIncomes._sum.amount ? Number(totalIncomes._sum.amount) : 0) -
            (totalExpenses._sum.amount ? Number(totalExpenses._sum.amount) : 0),
        },
        transactionsByType: transactionsByType.map(stat => ({
          type: stat.type,
          count: stat._count._all,
          total: stat._sum.amount ? Number(stat._sum.amount) : 0,
        })),
        accountBreakdown: accountsWithDetails,
        monthlyBreakdown: monthlyStats,
      };
    } catch (error) {
      console.error('Error getting category statistics', error);
      throw new InternalServerErrorException('Failed to get category statistics');
    }
  }

  async getRecipientStatistics(
    userId: string,
    recipientId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Vérifier que le recipient appartient à l'utilisateur
    const recipient = await this.prisma.recipient.findFirst({
      where: {
        id: recipientId,
        userId: userId,
      },
    });

    if (!recipient) {
      throw new Error('Recipient not found or access denied');
    }

    // Récupérer toutes les transactions du recipient dans la période
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: userId,
        recipientId: recipientId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        account: true,
        category: true,
      },
    });

    // Calculs de base
    const totalTransactions = transactions.length;
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const incomes = transactions.filter(t => t.type === 'INCOME');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncomes = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
    const netBalance = totalIncomes - totalExpenses;

    // Répartition par compte
    const accountBreakdown = {};
    transactions.forEach(transaction => {
      const accountId = transaction.accountId;
      const accountName = transaction.account.name;
      
      if (!accountBreakdown[accountId]) {
        accountBreakdown[accountId] = {
          accountId,
          accountName,
          totalTransactions: 0,
          totalExpenses: 0,
          totalIncomes: 0,
          netBalance: 0,
        };
      }
      
      accountBreakdown[accountId].totalTransactions++;
      
      if (transaction.type === 'EXPENSE') {
        accountBreakdown[accountId].totalExpenses += Number(transaction.amount);
      } else {
        accountBreakdown[accountId].totalIncomes += Number(transaction.amount);
      }
      
      accountBreakdown[accountId].netBalance = 
        accountBreakdown[accountId].totalIncomes - accountBreakdown[accountId].totalExpenses;
    });

    // Répartition par catégorie
    const categoryBreakdown = {};
    transactions.forEach(transaction => {
      const categoryId = transaction.categoryId;
      const categoryName = transaction.category.name;
      
      if (!categoryBreakdown[categoryId]) {
        categoryBreakdown[categoryId] = {
          categoryId,
          categoryName,
          totalTransactions: 0,
          totalExpenses: 0,
          totalIncomes: 0,
          netBalance: 0,
        };
      }
      
      categoryBreakdown[categoryId].totalTransactions++;
      
      if (transaction.type === 'EXPENSE') {
        categoryBreakdown[categoryId].totalExpenses += Number(transaction.amount);
      } else {
        categoryBreakdown[categoryId].totalIncomes += Number(transaction.amount);
      }
      
      categoryBreakdown[categoryId].netBalance = 
        categoryBreakdown[categoryId].totalIncomes - categoryBreakdown[categoryId].totalExpenses;
    });

    // Répartition mensuelle
    const monthlyBreakdown = {};
    transactions.forEach(transaction => {
      const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = {
          month,
          totalTransactions: 0,
          totalExpenses: 0,
          totalIncomes: 0,
          netBalance: 0,
        };
      }
      
      monthlyBreakdown[month].totalTransactions++;
      
      if (transaction.type === 'EXPENSE') {
        monthlyBreakdown[month].totalExpenses += Number(transaction.amount);
      } else {
        monthlyBreakdown[month].totalIncomes += Number(transaction.amount);
      }
      
      monthlyBreakdown[month].netBalance = 
        monthlyBreakdown[month].totalIncomes - monthlyBreakdown[month].totalExpenses;
    });

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      recipient: {
        id: recipient.id,
        name: recipient.name,
      },
      summary: {
        totalTransactions,
        totalExpenses,
        totalIncomes,
        netBalance,
      },
      transactionTypeBreakdown: {
        expenses: {
          count: expenses.length,
          total: totalExpenses,
        },
        incomes: {
          count: incomes.length,
          total: totalIncomes,
        },
      },
      accountBreakdown: Object.values(accountBreakdown),
      categoryBreakdown: Object.values(categoryBreakdown),
      monthlyBreakdown: Object.values(monthlyBreakdown).sort((a: any, b: any) => a.month.localeCompare(b.month)),
    };
  }
}
