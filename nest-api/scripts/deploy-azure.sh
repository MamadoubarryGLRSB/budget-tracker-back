#!/bin/bash

# Configuration - Utiliser des noms uniques avec un timestamp
TIMESTAMP=$(date +%Y%m%d%H%M)
RESOURCE_GROUP="rg-budget-tracker-${TIMESTAMP}"  # Groupe unique aussi
LOCATION="northeurope"  # Changer de région
APP_NAME="budget-tracker-api-${TIMESTAMP}"  # Nom unique
DB_SERVER_NAME="budget-tracker-db-${TIMESTAMP}"  # Nom unique
DB_NAME="budget_tracker"
DB_ADMIN="dbadmin"
DB_PASSWORD="BudgetTracker@2024Secure!"  # Mot de passe sécurisé
APP_SERVICE_PLAN="asp-budget-tracker-${TIMESTAMP}"

echo "🚀 Déploiement de Budget Tracker sur Azure"
echo "📌 Nom de l'app: ${APP_NAME}"
echo "📌 Nom de la DB: ${DB_SERVER_NAME}"
echo "📌 Groupe de ressources: ${RESOURCE_GROUP}"

# 1. Créer le groupe de ressources
echo "📦 Création du groupe de ressources..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Créer le serveur PostgreSQL avec le bon SKU et tier
echo "🗄️ Création du serveur PostgreSQL..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location $LOCATION \
  --admin-user $DB_ADMIN \
  --admin-password $DB_PASSWORD \
  --tier Burstable \
  --sku-name Standard_B1ms \
  --version 13 \
  --storage-size 32 \
  --public-access 0.0.0.0

# 3. Créer la base de données
echo "📊 Création de la base de données..."
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME

# 4. Créer l'App Service Plan
echo "📱 Création de l'App Service Plan..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux

# 5. Créer l'App Service
echo "🌐 Création de l'App Service..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_NAME \
  --runtime "NODE:18-lts"

# 6. Configurer les variables d'environnement
echo "⚙️ Configuration des variables d'environnement..."
DATABASE_URL="postgresql://${DB_ADMIN}:${DB_PASSWORD}@${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    DATABASE_URL="$DATABASE_URL" \
    JWT_SECRET="your-super-secret-jwt-key-$(openssl rand -hex 32)" \
    NODE_ENV="production" \
    PORT=3000

# 7. Activer les logs
echo "📝 Activation des logs..."
az webapp log config \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --application-logging filesystem \
  --level information

# 8. Configurer le démarrage
echo "🚀 Configuration du démarrage..."
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "npm run start:prod"

echo "✅ Déploiement terminé !"
echo ""
echo "📋 Informations importantes :"
echo "- URL de l'application : https://${APP_NAME}.azurewebsites.net"
echo "- Base de données : ${DB_SERVER_NAME}.postgres.database.azure.com"
echo "- Groupe de ressources : $RESOURCE_GROUP"
echo ""
echo "⚠️ N'oubliez pas de :"
echo "1. Télécharger le profil de publication depuis le portail Azure"
echo "2. L'ajouter comme secret GitHub (AZURE_WEBAPP_PUBLISH_PROFILE)"
echo "3. Mettre à jour les règles de firewall PostgreSQL si nécessaire" 