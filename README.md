# 💰 Budget Tracker – API Backend

Bienvenue dans le backend de **Budget Tracker**, une API NestJS pour la gestion de budgets personnels.  
Ce guide te permet d’installer et tester le projet rapidement avec des commandes prêtes à copier-coller.

---

## ✅ Prérequis

Assure-toi d’avoir ces outils installés :

- **Docker & Docker Compose** → [Installation](https://docs.docker.com/get-docker/)
- **Git** → [Installation](https://git-scm.com/downloads)
- **PgAdmin** _(optionnel, pour visualiser la base de données)_
- Un fichier `.env` basé sur `env.example`

---

## 🚀 Installation rapide

### 1. Cloner le dépôt

```bash
git clone https://github.com/MamadoubarryGLRSB/budget-tracker-back.git
cd nest-api
```

### 2. Copier le fichier `.env` depuis l'exemple

```bash
cp .env.example .env
```

### 3. Lancer l’environnement avec Docker

```bash
docker compose up

npm run dev
```

L’API sera accessible à l’adresse :  
👉 **http://localhost:3000**

---

## 🧪 Données de test auto-remplies

La base de données démarre avec :

- 👤 2 utilisateurs
- 💳 3 comptes
- 🗂️ 5 catégories
- 💸 5 transactions

### 🔐 Identifiants de test

```txt
Email : john.doe@example.com
Mot de passe : password123
```

```txt
Email : jane.smith@example.com
Mot de passe : password123
```

---

## 📘 Documentation Swagger

Tu peux explorer tous les endpoints à l’aide de Swagger ici :  
👉 **http://localhost:3000/api**
