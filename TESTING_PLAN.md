# 🧪 Plan de Test - Plateforme de Trading Automatique

## 📋 Vue d'ensemble

Ce document décrit la stratégie de test complète pour valider le système de trading automatique avant le déploiement en production.

---

## 🎯 Objectifs de Test

1. **Validité Fonctionnelle**: Vérifier que toutes les fonctionnalités fonctionnent correctement
2. **Performance**: Assurer que le système peut gérer la charge prévue
3. **Sécurité**: Valider que les données et les transactions sont sécurisées
4. **Fiabilité**: Vérifier la stabilité et la récupération des erreurs
5. **Conformité**: S'assurer que le système respecte les règles des prop firms

---

## 🧬 Stratégie de Test

### Niveaux de Test

```
┌──────────────────────────────────────────────┐
│         Tests d'Acceptation (UAT)            │
│  - Validation métier                         │
│  - Scénarios réels                           │
└──────────────────────────────────────────────┘
                    ▲
┌──────────────────────────────────────────────┐
│      Tests de Performance & Charge           │
│  - Stress testing                            │
│  - Load testing                              │
│  - Endurance testing                         │
└──────────────────────────────────────────────┘
                    ▲
┌──────────────────────────────────────────────┐
│       Tests d'Intégration                    │
│  - API Backend                               │
│  - MT5 Bridge                                │
│  - Base de données                           │
└──────────────────────────────────────────────┘
                    ▲
┌──────────────────────────────────────────────┐
│       Tests Unitaires                        │
│  - Stratégies                                │
│  - Indicateurs                               │
│  - Risk Manager                              │
│  - Utilitaires                               │
└──────────────────────────────────────────────┘
```

---

## ✅ Tests Unitaires

### Backend (TypeScript)

#### 1. Tests d'Authentification

```typescript
// backend/tests/unit/auth.test.ts

describe('Authentication', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test('should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword'
      });
    
    expect(response.status).toBe(401);
  });
});
```

#### 2. Tests de Gestion des Comptes

```typescript
// backend/tests/unit/accounts.test.ts

describe('Account Management', () => {
  test('should create account', async () => {
    const response = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'DNA Funded Account',
        propFirm: 'DNA_FUNDED',
        balance: 10000
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('evaluation');
  });

  test('should get account details', async () => {
    const response = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(accountId);
  });

  test('should verify account', async () => {
    const response = await request(app)
      .post(`/api/accounts/${accountId}/verify`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('verified');
  });
});
```

#### 3. Tests de Gestion des Trades

```typescript
// backend/tests/unit/trades.test.ts

describe('Trade Management', () => {
  test('should create trade', async () => {
    const response = await request(app)
      .post('/api/trades')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId: accountId,
        symbol: 'EURUSD',
        type: 'BUY',
        entryPrice: 1.0850,
        volume: 0.1,
        stopLoss: 1.0820,
        takeProfit: 1.0900,
        strategy: 'TREND_FOLLOWING',
        confidence: 0.75
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('pending');
  });

  test('should close trade', async () => {
    const response = await request(app)
      .post(`/api/trades/${tradeId}/close`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        exitPrice: 1.0900
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('closed');
    expect(response.body.data.profit).toBeGreaterThan(0);
  });
});
```

### MT5 Bridge (Python)

#### 1. Tests des Stratégies

```python
# mt5_bridge/tests/test_strategies.py

import pytest
import numpy as np
from strategies.trend_following import TrendFollowingStrategy
from strategies.mean_reversion import MeanReversionStrategy
from strategies.scalping import ScalpingStrategy


class TestTrendFollowingStrategy:
    def setup_method(self):
        self.strategy = TrendFollowingStrategy()
        self.sample_rates = self._generate_sample_rates()
    
    def _generate_sample_rates(self):
        """Generate sample OHLC data"""
        closes = np.array([1.0800 + i * 0.0001 for i in range(100)])
        return [
            {
                'open': closes[i],
                'high': closes[i] + 0.0005,
                'low': closes[i] - 0.0005,
                'close': closes[i]
            }
            for i in range(len(closes))
        ]
    
    def test_bullish_signal(self):
        """Test bullish signal generation"""
        signal = self.strategy.analyze(self.sample_rates, 'EURUSD')
        
        assert signal is not None
        assert signal['action'] == 'BUY'
        assert signal['confidence'] >= 0.6
        assert signal['entry_price'] > 0
        assert signal['take_profit'] > signal['entry_price']
        assert signal['stop_loss'] < signal['entry_price']
    
    def test_risk_reward_ratio(self):
        """Test risk/reward ratio calculation"""
        signal = self.strategy.analyze(self.sample_rates, 'EURUSD')
        
        if signal:
            risk = abs(signal['entry_price'] - signal['stop_loss'])
            reward = abs(signal['take_profit'] - signal['entry_price'])
            ratio = reward / risk if risk > 0 else 0
            
            assert ratio >= 1.0


class TestMeanReversionStrategy:
    def setup_method(self):
        self.strategy = MeanReversionStrategy()
        self.sample_rates = self._generate_sample_rates()
    
    def _generate_sample_rates(self):
        """Generate sample OHLC data with volatility"""
        closes = np.array([1.0850 + np.sin(i * 0.1) * 0.001 for i in range(100)])
        return [
            {
                'open': closes[i],
                'high': closes[i] + 0.0015,
                'low': closes[i] - 0.0015,
                'close': closes[i]
            }
            for i in range(len(closes))
        ]
    
    def test_mean_reversion_signal(self):
        """Test mean reversion signal"""
        signal = self.strategy.analyze(self.sample_rates, 'EURUSD')
        
        if signal:
            assert signal['action'] in ['BUY', 'SELL']
            assert signal['confidence'] >= 0.65


class TestScalpingStrategy:
    def setup_method(self):
        self.strategy = ScalpingStrategy()
        self.sample_rates = self._generate_sample_rates()
    
    def _generate_sample_rates(self):
        """Generate sample OHLC data for scalping"""
        closes = np.array([1.0850 + np.random.randn(100) * 0.0005])
        return [
            {
                'open': closes[i],
                'high': closes[i] + 0.0001,
                'low': closes[i] - 0.0001,
                'close': closes[i]
            }
            for i in range(len(closes))
        ]
    
    def test_rsi_signal(self):
        """Test RSI-based signal"""
        signal = self.strategy.analyze(self.sample_rates, 'EURUSD')
        
        if signal:
            assert signal['action'] in ['BUY', 'SELL']
            assert 'rsi' in signal['indicators']
```

#### 2. Tests du Risk Manager

```python
# mt5_bridge/tests/test_risk_manager.py

import pytest
from risk_manager import RiskManager


class TestRiskManager:
    def setup_method(self):
        self.risk_manager = RiskManager()
        self.account_info = {
            'balance': 10000,
            'equity': 10000,
            'free_margin': 10000,
            'margin_level': 1000
        }
    
    def test_valid_trade(self):
        """Test valid trade validation"""
        signal = {
            'strategy': 'TREND_FOLLOWING',
            'symbol': 'EURUSD',
            'action': 'BUY',
            'confidence': 0.75,
            'entry_price': 1.0850,
            'take_profit': 1.0900,
            'stop_loss': 1.0820
        }
        
        result = self.risk_manager.validate_trade(signal, self.account_info)
        assert result is True
    
    def test_invalid_risk_reward_ratio(self):
        """Test rejection of poor risk/reward ratio"""
        signal = {
            'strategy': 'TREND_FOLLOWING',
            'symbol': 'EURUSD',
            'action': 'BUY',
            'confidence': 0.75,
            'entry_price': 1.0850,
            'take_profit': 1.0855,  # Très proche
            'stop_loss': 1.0820     # Trop loin
        }
        
        result = self.risk_manager.validate_trade(signal, self.account_info)
        assert result is False
    
    def test_daily_loss_limit(self):
        """Test daily loss limit enforcement"""
        # Simuler des pertes
        self.risk_manager.daily_loss = -600  # 6% de perte
        
        signal = {
            'strategy': 'TREND_FOLLOWING',
            'symbol': 'EURUSD',
            'action': 'BUY',
            'confidence': 0.75,
            'entry_price': 1.0850,
            'take_profit': 1.0900,
            'stop_loss': 1.0820
        }
        
        result = self.risk_manager.validate_trade(signal, self.account_info)
        assert result is False
```

---

## 🔗 Tests d'Intégration

### Backend + MT5 Bridge

```typescript
// backend/tests/integration/trading-flow.test.ts

describe('Complete Trading Flow', () => {
  test('should execute complete trading cycle', async () => {
    // 1. Register user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'trader@example.com',
        password: 'SecurePass123!',
        firstName: 'Trader',
        lastName: 'Test'
      });
    
    const token = registerRes.body.data.token;
    
    // 2. Create account
    const accountRes = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Account',
        propFirm: 'DNA_FUNDED',
        balance: 10000
      });
    
    const accountId = accountRes.body.data.id;
    
    // 3. Create strategy
    const strategyRes = await request(app)
      .post('/api/strategies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId,
        type: 'TREND_FOLLOWING',
        enabled: true
      });
    
    // 4. Create trade
    const tradeRes = await request(app)
      .post('/api/trades')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId,
        symbol: 'EURUSD',
        type: 'BUY',
        entryPrice: 1.0850,
        volume: 0.1,
        stopLoss: 1.0820,
        takeProfit: 1.0900,
        strategy: 'TREND_FOLLOWING',
        confidence: 0.75
      });
    
    const tradeId = tradeRes.body.data.id;
    
    // 5. Close trade
    const closeRes = await request(app)
      .post(`/api/trades/${tradeId}/close`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        exitPrice: 1.0900
      });
    
    // 6. Verify statistics
    const statsRes = await request(app)
      .get(`/api/trades/stats/${accountId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(statsRes.body.data.totalTrades).toBe(1);
    expect(statsRes.body.data.winningTrades).toBe(1);
    expect(statsRes.body.data.winRate).toBe(100);
  });
});
```

---

## 📊 Tests de Performance

### Load Testing

```bash
# Utiliser Apache JMeter ou k6

# k6 script (load-test.js)
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up
    { duration: '5m', target: 100 },  // Stay
    { duration: '2m', target: 0 },    // Ramp-down
  ],
};

export default function () {
  let res = http.get('http://localhost:3001/api/dashboard/stats/overview');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### Stress Testing

```bash
# Tester avec charge maximale
k6 run --vus 1000 --duration 30s load-test.js
```

---

## 🎯 Tests d'Acceptation (UAT)

### Scénarios Métier

#### Scénario 1: Validation d'un Compte DNA Funded

```gherkin
Feature: DNA Funded Account Validation
  
  Scenario: Successfully validate and trade on DNA Funded account
    Given I have a DNA Funded account with 10000€
    And I have enabled the Trend Following strategy
    When the market shows a bullish trend
    Then the system should generate a BUY signal
    And the trade should respect the 10% max drawdown rule
    And the trade should respect the 5% daily loss limit
    And the profit should be split 80/20 with the trader keeping 80%
```

#### Scénario 2: Risk Management

```gherkin
Feature: Risk Management
  
  Scenario: Prevent trading when daily loss limit is reached
    Given I have lost 5% of my account today
    When a new trading signal is generated
    Then the system should reject the trade
    And the account should be paused
```

#### Scénario 3: Multi-Account Scaling

```gherkin
Feature: Multi-Account Scaling
  
  Scenario: Scale from 1 to 10 accounts
    Given I have 1 account generating 5% profit/month
    When I add 9 more accounts
    Then the total profit should be approximately 50€/month
    And each account should trade independently
```

---

## 🔒 Tests de Sécurité

### Authentification

```typescript
test('should reject request without token', async () => {
  const response = await request(app)
    .get('/api/accounts');
  
  expect(response.status).toBe(401);
});

test('should reject request with invalid token', async () => {
  const response = await request(app)
    .get('/api/accounts')
    .set('Authorization', 'Bearer invalid-token');
  
  expect(response.status).toBe(401);
});
```

### Injection SQL

```typescript
test('should prevent SQL injection', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: "'; DROP TABLE users; --",
      password: 'test'
    });
  
  expect(response.status).toBe(401);
  // Vérifier que la table existe toujours
});
```

### Rate Limiting

```typescript
test('should enforce rate limiting', async () => {
  for (let i = 0; i < 101; i++) {
    const response = await request(app)
      .get('/api/dashboard/stats/overview')
      .set('Authorization', `Bearer ${token}`);
    
    if (i < 100) {
      expect(response.status).toBe(200);
    } else {
      expect(response.status).toBe(429); // Too Many Requests
    }
  }
});
```

---

## 📋 Checklist de Test

### Avant le Déploiement

- [ ] Tous les tests unitaires passent
- [ ] Tous les tests d'intégration passent
- [ ] Tests de performance réussis (< 500ms)
- [ ] Tests de sécurité passés
- [ ] Tests d'acceptation validés
- [ ] Aucun warning dans les logs
- [ ] Documentation mise à jour
- [ ] Backup automatique configuré
- [ ] Monitoring en place
- [ ] Plan de rollback préparé

### En Production

- [ ] Monitoring 24/7 actif
- [ ] Alertes configurées
- [ ] Logs centralisés
- [ ] Backups quotidiens
- [ ] Équipe de support disponible
- [ ] Procédure d'escalade définie

---

## 📈 Métriques de Succès

| Métrique | Cible | Réel |
|----------|-------|------|
| **Couverture de code** | > 80% | - |
| **Temps de réponse API** | < 500ms | - |
| **Disponibilité** | > 99.9% | - |
| **Taux d'erreur** | < 0.1% | - |
| **Win Rate** | > 45% | - |
| **Profit Factor** | > 1.5 | - |

---

## 🚀 Exécution des Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance

# Tous les tests
npm run test:all

# Avec couverture
npm run test:coverage
```

---

**Créé le**: 3 janvier 2026  
**Version**: 1.0.0  
**Statut**: À Exécuter avant Phase 5
