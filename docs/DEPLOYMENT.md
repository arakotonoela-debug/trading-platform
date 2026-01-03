# Guide de Déploiement - Plateforme de Trading Automatique

## 📋 Table des matières

1. [Déploiement Local](#déploiement-local)
2. [Déploiement Docker](#déploiement-docker)
3. [Déploiement Production](#déploiement-production)
4. [Configuration VPS](#configuration-vps)
5. [Monitoring et Maintenance](#monitoring-et-maintenance)

## 🏠 Déploiement Local

### Prérequis

- Node.js 18+
- Python 3.9+
- PostgreSQL 12+
- Git

### Installation Complète

#### 1. Backend

```bash
cd backend
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrage
npm run dev
```

L'API sera disponible sur `http://localhost:3001`

#### 2. Frontend

```bash
cd frontend
npm install

# Démarrage
npm run dev
```

L'interface sera disponible sur `http://localhost:5173`

#### 3. MT5 Bridge

```bash
cd mt5_bridge
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt

# Configuration
cp .env.example .env

# Démarrage
python src/main.py
```

Le bridge sera disponible sur `http://localhost:5000`

## 🐳 Déploiement Docker

### Prérequis

- Docker 20.10+
- Docker Compose 2.0+

### Démarrage avec Docker Compose

```bash
# Build et démarrage
docker-compose -f docker/docker-compose.yml up -d

# Vérifier les services
docker-compose -f docker/docker-compose.yml ps

# Logs
docker-compose -f docker/docker-compose.yml logs -f

# Arrêt
docker-compose -f docker/docker-compose.yml down
```

### Accès aux Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **MT5 Bridge**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## ☁️ Déploiement Production

### Architecture Recommandée

```
┌─────────────────────────────────────────────────┐
│           Cloudflare / CDN                       │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│        Nginx (Reverse Proxy)                    │
│        - SSL/TLS                                │
│        - Load Balancing                         │
└────────────────────┬────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐    ┌─────▼─────┐    ┌────▼────┐
│Backend │    │ MT5 Bridge│    │Frontend  │
│(Node)  │    │ (Python)  │    │(React)   │
└───┬────┘    └─────┬─────┘    └────┬────┘
    │                │                │
    └────────────────┼────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼───┐  ┌───▼────┐  ┌──▼──────┐
    │PostgreSQL│ │ Redis  │  │ Logs    │
    └─────────┘  └────────┘  └─────────┘
```

### Déploiement sur VPS (Recommandé: DigitalOcean, Linode, AWS)

#### 1. Configuration du Serveur

```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y curl wget git build-essential

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

#### 2. Clonage et Configuration

```bash
# Cloner le projet
git clone https://github.com/your-repo/trading-platform.git
cd trading-platform

# Configuration
cp .env.example .env
# Éditer .env avec les paramètres production
nano .env

# Permissions
chmod +x scripts/*.sh
```

#### 3. Démarrage avec Docker

```bash
# Build des images
docker-compose -f docker/docker-compose.yml build

# Démarrage
docker-compose -f docker/docker-compose.yml up -d

# Vérification
docker-compose -f docker/docker-compose.yml ps
```

#### 4. Configuration Nginx

```nginx
# /etc/nginx/sites-available/trading-platform

upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:5173;
}

upstream mt5_bridge {
    server localhost:5000;
}

server {
    listen 80;
    server_name trading.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name trading.example.com;

    ssl_certificate /etc/letsencrypt/live/trading.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/trading.example.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # MT5 Bridge
    location /mt5 {
        proxy_pass http://mt5_bridge;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;
}
```

Activation:
```bash
sudo ln -s /etc/nginx/sites-available/trading-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL/TLS avec Let's Encrypt

```bash
# Installation de Certbot
sudo apt install -y certbot python3-certbot-nginx

# Génération du certificat
sudo certbot certonly --standalone -d trading.example.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
```

## 🔄 Configuration VPS pour Trading 24/7

### 1. Systemd Service

Créer `/etc/systemd/system/trading-platform.service`:

```ini
[Unit]
Description=Trading Platform
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/trading-platform
ExecStart=/usr/local/bin/docker-compose -f docker/docker-compose.yml up
ExecStop=/usr/local/bin/docker-compose -f docker/docker-compose.yml down
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activation:
```bash
sudo systemctl daemon-reload
sudo systemctl enable trading-platform
sudo systemctl start trading-platform
```

### 2. Monitoring avec Systemd

```bash
# Vérifier le statut
sudo systemctl status trading-platform

# Logs
sudo journalctl -u trading-platform -f

# Redémarrage automatique
sudo systemctl restart trading-platform
```

### 3. Backup Automatique

Créer `/home/ubuntu/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec trading-db pg_dump -U postgres trading_platform > \
    $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup logs
tar -czf $BACKUP_DIR/logs_backup_$TIMESTAMP.tar.gz \
    /home/ubuntu/trading_platform/backend/logs \
    /home/ubuntu/trading_platform/mt5_bridge/logs

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed at $TIMESTAMP"
```

Cron job:
```bash
# Backup quotidien à 2h du matin
0 2 * * * /home/ubuntu/backup.sh
```

## 📊 Monitoring et Maintenance

### 1. Health Checks

```bash
# Backend
curl http://localhost:3001/health

# Frontend
curl http://localhost:5173

# MT5 Bridge
curl http://localhost:5000/health
```

### 2. Monitoring avec Prometheus (Optionnel)

Ajouter à `docker-compose.yml`:

```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
```

### 3. Logs Centralisés

```bash
# Voir les logs de tous les services
docker-compose -f docker/docker-compose.yml logs -f

# Logs spécifiques
docker-compose -f docker/docker-compose.yml logs -f backend
docker-compose -f docker/docker-compose.yml logs -f mt5-bridge
```

### 4. Performance Tuning

#### PostgreSQL
```sql
-- Augmenter shared_buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Augmenter work_mem
ALTER SYSTEM SET work_mem = '16MB';

-- Redémarrer
SELECT pg_reload_conf();
```

#### Redis
```bash
# Augmenter maxmemory
redis-cli CONFIG SET maxmemory 512mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## 🚨 Troubleshooting

### Problèmes Courants

#### 1. Services ne démarrent pas
```bash
# Vérifier les logs
docker-compose -f docker/docker-compose.yml logs

# Redémarrer les services
docker-compose -f docker/docker-compose.yml restart

# Reconstruire les images
docker-compose -f docker/docker-compose.yml build --no-cache
```

#### 2. Erreurs de connexion à MT5
```bash
# Vérifier la configuration
cat .env | grep MT5

# Tester la connexion
python mt5_bridge/src/test_connection.py
```

#### 3. Problèmes de performance
```bash
# Vérifier l'utilisation des ressources
docker stats

# Augmenter les limites
docker-compose -f docker/docker-compose.yml up -d --scale backend=2
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 3
```

### Load Balancing avec Nginx

```nginx
upstream backend {
    server backend:3001;
    server backend:3002;
    server backend:3003;
}
```

## ✅ Checklist de Déploiement

- [ ] Domaine configuré
- [ ] SSL/TLS activé
- [ ] Firewall configuré
- [ ] Backups automatiques activés
- [ ] Monitoring en place
- [ ] Logs centralisés
- [ ] Alertes configurées
- [ ] Documentation mise à jour
- [ ] Tests en production
- [ ] Plan de rollback préparé

## 📞 Support

Pour toute question ou problème de déploiement, consultez:
- Documentation technique
- Logs d'erreur
- GitHub Issues
