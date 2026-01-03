# Guide du Frontend - Trading Platform

## 📋 Vue d'Ensemble

Le frontend est une application React 19 moderne avec TypeScript, Tailwind CSS et Recharts pour les graphiques. Il fournit une interface complète pour gérer les comptes de trading, visualiser les performances et configurer les stratégies.

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Header.tsx       # En-tête avec menu utilisateur
│   │   ├── Sidebar.tsx      # Menu de navigation
│   │   ├── Card.tsx         # Carte de données
│   │   ├── Chart.tsx        # Graphiques (Line, Area, Bar)
│   │   ├── TradeTable.tsx   # Tableau des trades
│   │   ├── Alert.tsx        # Alertes et notifications
│   │   └── Layout.tsx       # Layout principal
│   ├── pages/               # Pages principales
│   │   ├── LoginPage.tsx    # Connexion
│   │   ├── DashboardPage.tsx # Dashboard principal
│   │   ├── AccountsPage.tsx  # Gestion des comptes
│   │   ├── TradesPage.tsx    # Historique des trades
│   │   └── StrategiesPage.tsx # Configuration des stratégies
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useAuth.ts       # Gestion de l'authentification
│   │   ├── useAccounts.ts   # Gestion des comptes
│   │   └── useTrades.ts     # Gestion des trades
│   ├── store/               # Zustand stores
│   │   └── authStore.ts     # Store d'authentification
│   ├── App.tsx              # Composant racine
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── index.html               # HTML principal
├── package.json             # Dépendances
├── vite.config.ts           # Configuration Vite
└── tsconfig.json            # Configuration TypeScript
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
cd frontend
npm install
```

### Développement
```bash
npm run dev
```

L'application sera disponible à `http://localhost:5173`

### Build Production
```bash
npm run build
```

### Preview Production
```bash
npm run preview
```

## 📦 Dépendances Principales

### Framework & Build
- `react` 19.0.0 - Framework UI
- `react-dom` 19.0.0 - Rendu React
- `react-router-dom` 6.x - Routage
- `vite` 5.x - Build tool
- `typescript` 5.x - Typage statique

### UI & Styling
- `tailwindcss` 3.4.1 - Utility-first CSS
- `lucide-react` 0.x - Icônes
- `recharts` 2.10.3 - Graphiques

### State Management
- `zustand` 4.4.7 - Gestion d'état légère

### HTTP Client
- `fetch` API (natif) - Requêtes HTTP

## 🎨 Composants Principaux

### Header
Affiche le logo, les notifications et le menu utilisateur.

```tsx
<Header />
```

### Sidebar
Menu de navigation avec les sections principales.

```tsx
<Sidebar />
```

### Card
Carte de données avec titre, valeur et tendance.

```tsx
<Card
  title="Solde Total"
  value="50,000€"
  trend="up"
  trendValue="+12.5%"
  icon={<Wallet size={32} />}
/>
```

### Chart
Graphiques interactifs (Line, Area, Bar).

```tsx
<Chart
  type="area"
  data={data}
  dataKey="profit"
  title="Performance"
  color="#3b82f6"
/>
```

### TradeTable
Tableau des trades avec filtrage et actions.

```tsx
<TradeTable
  trades={trades}
  onTradeClick={(trade) => console.log(trade)}
/>
```

### Alert
Alertes et notifications.

```tsx
<Alert
  type="success"
  title="Succès"
  message="Opération réussie"
/>
```

## 🪝 Hooks Personnalisés

### useAuth
Gestion de l'authentification.

```tsx
const { user, token, login, register, logout, isLoading, error } = useAuth();
```

### useAccounts
Gestion des comptes.

```tsx
const {
  accounts,
  loading,
  error,
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccount,
} = useAccounts();
```

### useTrades
Gestion des trades.

```tsx
const {
  trades,
  loading,
  error,
  fetchTrades,
  createTrade,
  closeTrade,
  getTrade,
  getTradeStats,
} = useTrades();
```

## 📱 Pages

### LoginPage
Page de connexion avec formulaire d'authentification.

**Route**: `/login`

### DashboardPage
Dashboard principal avec:
- Statistiques clés (solde, profit, taux de gain)
- Graphiques de performance
- Comptes actifs
- Trades récents

**Route**: `/dashboard`

### AccountsPage
Gestion des comptes avec:
- Liste des comptes
- Création de nouveaux comptes
- Modification et suppression
- Statistiques par compte

**Route**: `/accounts`

### TradesPage
Historique des trades avec:
- Liste complète des trades
- Filtrage par statut et symbole
- Statistiques (win rate, profit factor)
- Export CSV

**Route**: `/trades`

### StrategiesPage
Configuration des stratégies avec:
- Liste des stratégies
- Activation/désactivation
- Configuration des paramètres
- Statistiques de performance

**Route**: `/strategies`

## 🔐 Authentification

L'authentification utilise JWT tokens stockés dans localStorage.

### Flow de Connexion
1. Utilisateur entre email et mot de passe
2. Requête POST à `/api/auth/login`
3. Backend retourne token et user
4. Token stocké dans localStorage
5. Redirection vers `/dashboard`

### Flow de Déconnexion
1. Utilisateur clique sur "Déconnexion"
2. Token supprimé de localStorage
3. Redirection vers `/login`

## 🎯 Gestion d'État

Zustand est utilisé pour la gestion d'état globale.

### authStore
```tsx
const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();
```

## 🌐 Intégration API

Les hooks utilisent l'API fetch native pour communiquer avec le backend.

### Configuration
- **Base URL**: `http://localhost:3001`
- **Headers**: `Authorization: Bearer {token}`
- **Content-Type**: `application/json`

### Endpoints Utilisés
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/accounts` - Lister les comptes
- `POST /api/accounts` - Créer un compte
- `PUT /api/accounts/:id` - Modifier un compte
- `DELETE /api/accounts/:id` - Supprimer un compte
- `GET /api/trades` - Lister les trades
- `POST /api/trades` - Créer un trade
- `POST /api/trades/:id/close` - Fermer un trade

## 🎨 Tailwind CSS

Le projet utilise Tailwind CSS pour le styling.

### Couleurs Principales
- Bleu: `#3b82f6` (blue-500)
- Vert: `#10b981` (green-500)
- Rouge: `#ef4444` (red-500)
- Gris: `#6b7280` (gray-500)

### Responsive Design
- Mobile first approach
- Breakpoints: sm, md, lg, xl
- Grid et Flexbox pour le layout

## 📊 Graphiques avec Recharts

Les graphiques utilisent Recharts pour la visualisation.

### Types Supportés
- **Line**: Graphiques en ligne
- **Area**: Graphiques en aire
- **Bar**: Graphiques en barres

### Exemple
```tsx
<Chart
  type="area"
  data={[
    { name: 'Jour 1', profit: 100 },
    { name: 'Jour 2', profit: 250 },
  ]}
  dataKey="profit"
  title="Performance"
  color="#3b82f6"
/>
```

## 🧪 Testing

### Tests Unitaires (Jest)
```bash
npm run test
```

### Tests d'Intégration
```bash
npm run test:integration
```

## 📝 Conventions de Code

### Naming
- Composants: PascalCase (e.g., `DashboardPage.tsx`)
- Fichiers: kebab-case ou PascalCase
- Variables: camelCase
- Constantes: UPPER_SNAKE_CASE

### Structure
- Un composant par fichier
- Exports nommés pour les composants
- Types/Interfaces en haut du fichier

### Styling
- Tailwind classes pour le styling
- Pas de CSS-in-JS
- Responsive design avec breakpoints

## 🚀 Déploiement

### Build
```bash
npm run build
```

### Fichiers de Build
- `dist/` - Dossier de production
- Prêt pour Nginx, Apache ou CDN

### Configuration Nginx
```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/trading-platform/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 🐛 Debugging

### React DevTools
Installez l'extension React DevTools pour Chrome/Firefox.

### Console
Utilisez `console.log()` pour déboguer.

### Network Tab
Vérifiez les requêtes API dans l'onglet Network.

## 📚 Ressources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)

## ✅ Checklist de Développement

- [ ] Installer les dépendances
- [ ] Configurer les variables d'environnement
- [ ] Démarrer le serveur de développement
- [ ] Vérifier que l'API backend fonctionne
- [ ] Tester la connexion
- [ ] Tester la création de compte
- [ ] Tester les pages principales
- [ ] Vérifier le responsive design
- [ ] Tester les graphiques
- [ ] Vérifier les performances

## 🆘 Troubleshooting

### Port 5173 déjà utilisé
```bash
npm run dev -- --port 3000
```

### Erreur CORS
Vérifiez que le backend a CORS configuré correctement.

### Token expiré
L'utilisateur sera redirigé vers `/login` automatiquement.

### Graphiques ne s'affichent pas
Vérifiez que les données sont au bon format.

---

**Créé le**: 3 janvier 2026
**Version**: 1.0.0
**Statut**: Production-Ready
