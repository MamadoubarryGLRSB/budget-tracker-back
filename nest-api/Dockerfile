# Utiliser l'image officielle de Node.js
FROM node:18-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Copier le dossier Prisma pour la génération du client
COPY prisma ./prisma

# Installer toutes les dépendances (dev et prod pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Supprimer les node_modules et réinstaller seulement les dépendances de production
RUN rm -rf node_modules && npm ci --only=production

# Exposer le port 3000
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "run", "start:prod"] 