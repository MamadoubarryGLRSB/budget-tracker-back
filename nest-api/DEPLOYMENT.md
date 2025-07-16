# 🚀 Guide de déploiement sur Azure

Ce guide explique comment déployer l'API Budget Tracker sur Azure avec un abonnement étudiant.

## 📋 Prérequis

- Un compte Azure avec abonnement étudiant
- Azure CLI installé (`az login` pour vous connecter)
- Git et GitHub configurés
- Node.js 18+ installé localement

## 🏗️ Architecture Azure

- **Azure App Service** : Hébergement de l'API NestJS
- **Azure Database for PostgreSQL** : Base de données
- **GitHub Actions** : CI/CD automatisé

## 📦 Étapes de déploiement

### 1. Préparation du code

```bash
# Cloner le repository
git clone <votre-repo>
cd nest-api

# Installer les dépendances
npm install

# Tester localement
docker-compose up -d
npm run start:dev
```

### 2. Déploiement automatique avec le script

```bash
# Exécuter le script de déploiement
./scripts/deploy-azure.sh
```

⚠️ **Important** : Modifiez le mot de passe dans le script avant de l'exécuter !

### 3. Configuration manuelle alternative

Si vous préférez créer les ressources via le portail Azure :

#### a. Créer un groupe de ressources
- Nom : `rg-budget-tracker`
- Région : `West Europe`

#### b. Créer PostgreSQL
- Type : PostgreSQL Flexible Server
- Nom : `budget-tracker-db`
- SKU : B_Standard_B1ms (le moins cher)
- Version : 13
- Activer l'accès public

#### c. Créer App Service
- Nom : `budget-tracker-api`
- Runtime : Node 18 LTS
- Plan : B1 (Basic)
- Région : West Europe

### 4. Configuration des variables d'environnement

Dans Azure Portal > App Service > Configuration > Application settings :

```
DATABASE_URL=postgresql://dbadmin:password@budget-tracker-db.postgres.database.azure.com:5432/budget_tracker?sslmode=require
JWT_SECRET=<générer-une-clé-secrète>
NODE_ENV=production
PORT=3000
```

### 5. Déploiement avec GitHub Actions

#### a. Télécharger le profil de publication
1. Azure Portal > votre App Service
2. Centre de déploiement > Gérer le profil de publication > Télécharger

#### b. Ajouter le secret GitHub
1. GitHub > Settings > Secrets > Actions
2. Nouveau secret : `AZURE_WEBAPP_PUBLISH_PROFILE`
3. Coller le contenu du fichier téléchargé

#### c. Pousser le code
```bash
git add .
git commit -m "Add Azure deployment configuration"
git push origin main
```

Le déploiement se lancera automatiquement !

## 🔧 Configuration post-déploiement

### 1. Exécuter les migrations Prisma

Via Azure Portal > App Service > Console :

```bash
npx prisma migrate deploy
```

### 2. (Optionnel) Seed de la base de données

```bash
npx prisma db seed
```

### 3. Configurer le firewall PostgreSQL

Azure Portal > PostgreSQL > Sécurité réseau :
- Ajouter l'IP de l'App Service
- Ajouter votre IP locale pour les tests

## 🧪 Tests

### Vérifier le déploiement

```bash
# Logs en temps réel
az webapp log tail --resource-group rg-budget-tracker --name budget-tracker-api

# Tester l'API
curl https://budget-tracker-api.azurewebsites.net/api
```

### Accéder à Swagger

Ouvrez : `https://budget-tracker-api.azurewebsites.net/api`

## 💰 Optimisation des coûts (Abonnement étudiant)

1. **App Service** : 
   - Utiliser le plan B1 (inclus dans les crédits)
   - Activer "Always On" seulement si nécessaire

2. **PostgreSQL** :
   - B_Standard_B1ms (le moins cher)
   - 32 GB de stockage (suffisant)
   - Arrêter le serveur quand non utilisé

3. **Monitoring** :
   - Application Insights gratuit jusqu'à 5GB/mois

## 🚨 Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs
az webapp log tail --resource-group rg-budget-tracker --name budget-tracker-api
```

### Erreur de connexion à la base de données
- Vérifier DATABASE_URL
- Vérifier les règles de firewall PostgreSQL
- S'assurer que SSL est activé (`?sslmode=require`)

### Erreur Prisma
```bash
# Regénérer le client Prisma
npx prisma generate

# Réexécuter les migrations
npx prisma migrate deploy
```

## 🔒 Sécurité

1. **Secrets** :
   - Ne jamais commit les .env
   - Utiliser Azure Key Vault pour les secrets sensibles

2. **CORS** :
   - Configurer les domaines autorisés dans main.ts

3. **HTTPS** :
   - Activé par défaut sur Azure App Service

## 📊 Monitoring

1. **Application Insights** :
   - Activer dans Azure Portal
   - Ajouter la clé d'instrumentation

2. **Alertes** :
   - Configurer des alertes pour les erreurs
   - Surveiller l'utilisation des crédits

## 🎓 Ressources utiles

- [Azure for Students](https://azure.microsoft.com/fr-fr/free/students/)
- [NestJS sur Azure](https://docs.microsoft.com/fr-fr/azure/app-service/quickstart-nodejs)
- [Prisma avec Azure PostgreSQL](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-azure) 