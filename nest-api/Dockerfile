# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build de l'application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Exposer le port
EXPOSE 3000

# Commande de démarrage - corriger le chemin
CMD ["node", "dist/src/main.js"] 