# 🤖 Plateforme de Trading Automatique

Une plateforme complète de trading automatique pour valider des comptes prop firm et générer 50 000€ de bénéfice mensuel.

## 📋 Vue d'ensemble

Cette plateforme automatise le trading sur des comptes prop firm (DNA Funded, BrightFunded, Top Tier Trader) en utilisant trois stratégies de trading éprouvées:

- **Trend Following**: Suit les tendances avec moyennes mobiles
- **Mean Reversion**: Revient à la moyenne avec bandes de Bollinger
- **Scalping**: Positions courtes avec RSI

## 🎯 Objectifs

- Valider des comptes prop firm de 10 000€
- Générer 5-10% de rendement mensuel par compte
- Scaler vers 10+ comptes pour atteindre 50 000€/mois
- Respecter les règles strictes des prop firms (max drawdown 10%, daily loss 5%)

## 🏗️ Architecture

### Stack Technologique

| Composant | Technologie | Port |
|-----------|-------------|------|
| **Backend** | Express.js + TypeScript | 3001 |
| **Frontend** | React 19 + TypeScript + Tailwind | 5173 |
| **MT5 Bridge** | Python + MetaTrader5 API | 5000 |
| **Base de données** | PostgreSQL (ou mock en-mémoire) | 5432 |

### Structure du Projet

```
trading_platform/
├── backend/              # API Express.js
│   ├── src/
│   │   ├── routes/       # Endpoints API
│   │   ├── services/     # Logique métier
│   │   ├── middleware/   # Auth, validation
│   │   └── utils/        # Helpers, logger
│   └── tests/            # Tests unitaires
├── frontend/             # Interface React
│   ├── src/
│   │   ├── components/   # Composants UI
│   │   ├── pages/        # Pages principales
│   │   └── services/     # Appels API
├── mt5_bridge/           # Connecteur Python MT5
│   ├── src/
│   │   ├── strategies/   # 3 stratégies
│   │   ├── indicators/   # Indicateurs techniques
│   │   └── execution/    # Exécution des ordres
└── docker/               # Configuration Docker
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Python 3.9+
- Docker (optionnel)
- MetaTrader 5 (pour connexion réelle)

### Installation

1. **Cloner le projet**
```bash
cd trading_platform
```

2. **Backend**
```bash
cd backend
npm install
npm run dev
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **MT5 Bridge**
```bash
cd mt5_bridge
pip install -r requirements.txt
python src/main.py
```

## 📚 Documentation

- [API Documentation](./docs/API.md) - Endpoints API complets
- [Architecture](./docs/ARCHITECTURE.md) - Architecture technique détaillée
- [Stratégies de Trading](./docs/TRADING_STRATEGIES.md) - Détails des stratégies
- [Déploiement](./docs/DEPLOYMENT.md) - Guide de déploiement production

## 🔑 Fonctionnalités Principales

### ✅ Authentification
- Inscription et connexion sécurisée
- JWT tokens
- Persistance utilisateur

### ✅ Gestion des Comptes
- Créer/modifier/supprimer des comptes prop firm
- Suivre le solde et les performances
- Gérer plusieurs comptes simultanément
- Statuts: Evaluation, Verified, Trading

### ✅ Moteur de Trading
- 3 stratégies automatisées
- Decision Engine (sélection automatique)
- Risk Manager (gestion stricte des risques)
- Execution Engine (envoi d'ordres automatique)

### ✅ Monitoring & Dashboard
- Statistiques en temps réel
- Graphiques de performance
- Tableau des trades
- Alertes et notifications
- Logs d'audit

### ✅ Gestion des Risques
- Daily loss limit
- Max drawdown
- Position size validation
- Risk scaling progressif
- Kill switch (fermer tous les trades)

## 📊 Indicateurs Techniques

1. **Moyennes Mobiles** (MA, EMA)
2. **Bandes de Bollinger** (BB)
3. **Average True Range** (ATR)
4. **Relative Strength Index** (RSI)
5. **MACD** (Momentum)
6. **Volatilité** (Écart-type)
7. **SL/TP Calculation** (Automatique)

## 💰 Calculs de Rentabilité

### Scénario 1: 1 Compte (10 000€)
- Rendement nécessaire: 100%/mois ❌ Non réaliste

### Scénario 2: 5 Comptes (50 000€ capital)
- Rendement par compte: 10%/mois
- Profit par compte: 1 000€
- **Total: 5 000€/mois** ⚠️ Pas assez

### Scénario 3: 10 Comptes (100 000€ capital) ✅ RECOMMANDÉ
- Rendement par compte: 5%/mois
- Profit par compte: 500€
- **Total: 5 000€/mois**

### Scénario 4: 50 Comptes (500 000€ capital) 🎯 OPTIMAL
- Rendement par compte: 2%/mois
- Profit par compte: 200€
- **Total: 10 000€/mois**

## 🔄 Flux de Trading Automatique

```
1. Données Marché (MT5 Bridge)
   ↓
2. Decision Engine (Analyse régime de marché)
   ↓
3. Stratégies (Trend, Mean-Reversion, Scalping)
   ↓
4. Meilleur Signal (Confiance + Force)
   ↓
5. Risk Manager (Validation)
   ↓
6. Execution Engine (Envoi d'ordres)
   ↓
7. Monitoring (Dashboard + Alertes)
   ↓
8. SL/TP Management (Fermeture automatique)
```

## 📋 Règles des Prop Firms

### DNA Funded (Recommandé)
- Frais: $99-$199
- Profit split: 80/20 (vous gardez 80%)
- Max drawdown: 10%
- Daily loss limit: 5%
- Durée: 30 jours

### BrightFunded
- Frais: $149
- Profit split: 70/30
- Max drawdown: 10%
- Daily loss limit: 5%

### Top Tier Trader
- Frais: $99
- Profit split: 80/20
- Max drawdown: 10%
- Daily loss limit: 5%

## 🧪 Tests

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test

# MT5 Bridge
cd mt5_bridge
pytest
```

## 📈 Roadmap d'Implémentation

### Phase 1: Infrastructure ✅ COMPLÉTÉE
- Setup du projet
- Base de données
- API Backend
- React Frontend
- MT5 Bridge

### Phase 2: Moteur de Trading ✅ COMPLÉTÉE
- 3 Stratégies
- Decision Engine
- Risk Manager
- Execution Engine

### Phase 3: Monitoring ✅ COMPLÉTÉE
- Dashboard
- Alertes
- Logs & Audit
- Statistiques

### Phase 4: Tests 🔄 EN COURS
- Backtesting
- Tests unitaires
- Tests d'intégration
- Tests de charge

### Phase 5: Déploiement 🔄 À FAIRE
- Configuration prop firm
- VPS setup
- Lancement en live
- Monitoring 24/7

### Phase 6: Scaling 🔄 À FAIRE
- Multi-comptes
- Optimisation
- Amélioration continue

## 🎯 Rendements Réalistes

- **Débutant**: 2-3%/mois
- **Intermédiaire**: 5-10%/mois
- **Avancé**: 10-20%/mois
- **Expert**: 20%+/mois

## ⚠️ Risques à Éviter

- ❌ Over-leverage
- ❌ Ignorer les stop-loss
- ❌ Trop de trades/jour
- ❌ Pas de diversification
- ❌ Émotions (FOMO, revenge trading)

## 🔐 Sécurité

- JWT tokens pour authentification
- Validation stricte des entrées
- Rate limiting sur les API
- Logs d'audit complets
- CORS configuré
- Helmet pour les headers de sécurité

## 📞 Support

Pour toute question ou problème:
1. Consultez la documentation
2. Vérifiez les logs
3. Testez en mode démo d'abord

## 📄 Licence

MIT

## 👨‍💻 Auteur

Trading Platform Team

---

**Créé le**: 3 janvier 2026  
**Version**: 1.0.0 (MVP)  
**Objectif**: 50 000€/mois en trading automatique
