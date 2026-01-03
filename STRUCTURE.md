# Structure du Projet Trading Platform

```
trading_platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── jwt.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── accountController.ts
│   │   │   ├── tradeController.ts
│   │   │   ├── strategyController.ts
│   │   │   └── dashboardController.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Account.ts
│   │   │   ├── Trade.ts
│   │   │   ├── Strategy.ts
│   │   │   └── Performance.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── accountService.ts
│   │   │   ├── tradingEngine.ts
│   │   │   ├── riskManager.ts
│   │   │   ├── strategyEngine.ts
│   │   │   ├── mt5Bridge.ts
│   │   │   └── monitoringService.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── accounts.ts
│   │   │   ├── trades.ts
│   │   │   ├── strategies.ts
│   │   │   └── dashboard.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   └── logging.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── validators.ts
│   │   │   ├── helpers.ts
│   │   │   └── constants.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Accounts/
│   │   │   ├── Trades/
│   │   │   ├── Strategies/
│   │   │   └── Common/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── mt5_bridge/
│   ├── src/
│   │   ├── mt5_connector.py
│   │   ├── strategies/
│   │   │   ├── trend_following.py
│   │   │   ├── mean_reversion.py
│   │   │   └── scalping.py
│   │   ├── indicators/
│   │   │   ├── moving_averages.py
│   │   │   ├── bollinger_bands.py
│   │   │   ├── rsi.py
│   │   │   ├── macd.py
│   │   │   ├── atr.py
│   │   │   └── volatility.py
│   │   ├── risk_manager.py
│   │   ├── execution_engine.py
│   │   ├── data_provider.py
│   │   ├── logger.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── config.yaml
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.mt5
│   └── docker-compose.yml
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── TRADING_STRATEGIES.md
│   └── DEPLOYMENT.md
├── scripts/
│   ├── setup.sh
│   ├── start.sh
│   ├── test.sh
│   └── deploy.sh
├── .gitignore
├── .env
├── .env.example
├── README.md
└── PROJECT_SUMMARY.md
```

## Description des Répertoires

### Backend (Express.js + TypeScript)
- **config/**: Configuration de la base de données, JWT, variables d'environnement
- **controllers/**: Logique des endpoints API
- **models/**: Schémas de données (User, Account, Trade, Strategy)
- **services/**: Logique métier (authentification, trading, risk management)
- **routes/**: Définition des endpoints API
- **middleware/**: Authentification, gestion d'erreurs, validation
- **utils/**: Utilitaires, loggers, constantes
- **types/**: Définitions TypeScript

### Frontend (React 19 + TypeScript + Tailwind)
- **components/**: Composants réutilisables (Auth, Dashboard, Accounts, etc.)
- **pages/**: Pages principales
- **hooks/**: Hooks personnalisés
- **services/**: Appels API
- **store/**: Gestion d'état (Zustand ou Redux)
- **types/**: Types TypeScript

### MT5 Bridge (Python)
- **mt5_connector.py**: Connexion à MetaTrader 5
- **strategies/**: Implémentation des 3 stratégies de trading
- **indicators/**: Calcul des indicateurs techniques
- **risk_manager.py**: Gestion des risques
- **execution_engine.py**: Exécution des ordres

### Docker
- Configuration pour containeriser l'application
- docker-compose.yml pour orchestrer les services

### Documentation
- API.md: Documentation des endpoints
- ARCHITECTURE.md: Architecture technique
- TRADING_STRATEGIES.md: Détails des stratégies
- DEPLOYMENT.md: Guide de déploiement
