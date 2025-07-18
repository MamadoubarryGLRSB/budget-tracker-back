# Budget Tracker API

A REST API for managing personal budget tracking built with NestJS and Prisma.

## Features

- User authentication with JWT
- Account management
- Transaction tracking
- Category management
- Recipient management
- Statistics and analytics
- Swagger documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Documentation**: Swagger
- **Deployment**: Railway

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=production
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Documentation

Once the server is running, visit `/api` for Swagger documentation.

## Database

The application uses PostgreSQL with Prisma ORM. Migrations are automatically run on deployment.

## Deployment

The application is deployed on Railway and automatically deploys on push to main branch.
