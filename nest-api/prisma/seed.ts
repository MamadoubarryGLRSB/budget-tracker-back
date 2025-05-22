import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base de données
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Base de données nettoyée');

  // Créer des utilisateurs
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: passwordHash,
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: passwordHash,
      firstName: 'Jane',
      lastName: 'Smith',
    },
  });

  console.log('Utilisateurs créés:', { user1, user2 });

  // Créer des comptes
  const account1 = await prisma.account.create({
    data: {
      userId: user1.id,
      name: 'Compte Courant',
      type: 'checking',
      balance: 1500.75,
      currency: 'EUR',
    },
  });

  const account2 = await prisma.account.create({
    data: {
      userId: user1.id,
      name: 'Épargne',
      type: 'savings',
      balance: 5000,
      currency: 'EUR',
    },
  });

  const account3 = await prisma.account.create({
    data: {
      userId: user2.id,
      name: 'Compte Principal',
      type: 'checking',
      balance: 2300.5,
      currency: 'EUR',
    },
  });

  console.log('Comptes créés:', { account1, account2, account3 });

  // Créer des catégories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: user1.id,
        name: 'Alimentation',
      },
    }),
    prisma.category.create({
      data: {
        userId: user1.id,
        name: 'Transport',
      },
    }),
    prisma.category.create({
      data: {
        userId: user1.id,
        name: 'Salaire',
      },
    }),
    prisma.category.create({
      data: {
        userId: user2.id,
        name: 'Loisirs',
      },
    }),
    prisma.category.create({
      data: {
        userId: user2.id,
        name: 'Freelance',
      },
    }),
  ]);

  console.log('Catégories créées:', categories);

  // Créer des transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        accountId: account1.id,
        categoryId: categories[0].id,
        userId: user1.id,
        date: new Date('2025-04-15'),
        description: 'Courses Carrefour',
        amount: 85.2,
        type: 'expense',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: account1.id,
        categoryId: categories[1].id,
        userId: user1.id,
        date: new Date('2025-04-12'),
        description: 'Essence',
        amount: 45.5,
        type: 'expense',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: account1.id,
        categoryId: categories[2].id,
        userId: user1.id,
        date: new Date('2025-04-05'),
        description: 'Salaire Avril',
        amount: 2500,
        type: 'income',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: account3.id,
        categoryId: categories[3].id,
        userId: user2.id,
        date: new Date('2025-04-18'),
        description: 'Cinéma',
        amount: 25,
        type: 'expense',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: account3.id,
        categoryId: categories[4].id,
        userId: user2.id,
        date: new Date('2025-04-10'),
        description: 'Projet client',
        amount: 800,
        type: 'income',
      },
    }),
  ]);

  console.log('Transactions créées:', transactions);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
