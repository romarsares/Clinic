# CI/CD Pipeline Setup Guide

## Overview
This guide will help you set up automated CI/CD pipeline for CuraOne using GitHub Actions to deploy to your Ubuntu server.

## Architecture
```
GitHub Push → GitHub Actions → Test → Build → Deploy to Ubuntu Server
                                                    ↓
                                            Docker Containers
                                            (MySQL, Redis, Nginx, App)
```

## Prerequisites

### 1. Ubuntu Server Requirements
- Ubuntu 20.04 or later
- Docker & Docker Compose installed
- Git installed
- SSH access enabled
- Minimum 2GB RAM, 20GB disk space

### 2. GitHub Repository
- Repository with admin access
- Ability to add secrets

## Setup Steps

### Step 1: Prepare Your Ubuntu Server

```bash
# SSH into your server
ssh your-user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git

# Create application directory
sudo mkdir -p /opt/clinic-saas
sudo chown $USER:$USER /opt/clinic-saas

# Clone repository
cd /opt/clinic-saas
git clonehttps://github.com/romarsares/Clinic.git .

# Create .env file
cp config/.env.example .env
nano .env  # Edit with your configuration
```

### Step 2: Generate SSH Key for GitHub Actions

```bash
# On your Ubuntu server, generate SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""

# Add public key to authorized_keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# Display private key (you'll need this for GitHub)
cat ~/.ssh/github-actions
```

### Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **SSH_PRIVATE_KEY**
   - Value: Content of `~/.ssh/github-actions` (private key from Step 2)

2. **SERVER_HOST**
   - Value: Your Ubuntu server IP or domain (e.g., `192.168.1.100`)

3. **SERVER_USER**
   - Value: Your Ubuntu username (e.g., `ubuntu` or `your-username`)

4. **MYSQL_ROOT_PASSWORD** (optional, for database operations)
   - Value: Your MySQL root password from .env file

### Step 4: Make Deployment Script Executable

```bash
# On your Ubuntu server
cd /opt/clinic-saas
chmod +x scripts/deploy-ci-cd.sh

```

### Step 5: Initial Manual Deployment

```bash
# Run initial deployment manually to ensure everything works
cd /opt/clinic-saas
./scripts/deploy-ubuntu.sh
```

### Step 6: Test CI/CD Pipeline

```bash
# On your local machine
git add .
git commit -m "Setup CI/CD pipeline"
git push origin clinic-staging
```

Watch the GitHub Actions tab in your repository to see the pipeline run.

## Pipeline Stages

### 1. Test Stage
- Runs on every push and pull request
- Sets up MySQL test database
- Installs dependencies
- Runs linter
- Executes test suite

### 2. Build Stage
- Runs after tests pass
- Installs production dependencies
- Builds application assets

### 3. Deploy Stage
- Runs only on `main` branch pushes
- Creates backup of current deployment
- Pulls latest code
- Installs dependencies
- Runs database migrations
- Restarts Docker containers
- Performs health check
- Rolls back on failure

## Manual Operations

### Deploy Manually
```bash
ssh your-user@your-server-ip
cd /opt/clinic-saas
./scripts/deploy-ci-cd.sh deploy
```

### Rollback to Previous Version
```bash
ssh your-user@your-server-ip
cd /opt/clinic-saas
./scripts/deploy-ci-cd.sh rollback
```

### Create Backup Only
```bash
ssh your-user@your-server-ip
cd /opt/clinic-saas
./scripts/deploy-ci-cd.sh backup
```

### View Logs
```bash
# Application logs
docker-compose logs -f clinic-api

# All services
docker-compose logs -f

# Nginx logs
docker-compose logs -f clinic-nginx
```

### Check Container Status
```bash
docker-compose ps
```

## Environment Configuration

### Production .env File
```bash
# Database
MYSQL_ROOT_PASSWORD=your-secure-root-password
DB_PASSWORD=your-secure-db-password
DB_HOST=clinic-db
DB_USER=clinic_user
DB_NAME=clinic_saas

# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-32-char-encryption-key-here

# Redis
REDIS_URL=redis://clinic-redis:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Monitoring & Maintenance

### Health Check Endpoint
```bash
curl http://your-server-ip:3000/health
```

### Database Backup
```bash
# Manual backup
docker exec clinic-db mysqldump -u root -p clinic_saas > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
0 2 * * * docker exec clinic-db mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" clinic_saas > /opt/clinic-saas_backups/db_$(date +\%Y\%m\%d).sql
```

### Update SSL Certificates
```bash
# Replace self-signed certificates with real ones
sudo cp your-certificate.crt /opt/clinic-saas/config/nginx/ssl/
sudo cp your-private-key.key /opt/clinic-saas/config/nginx/ssl/
docker-compose restart clinic-nginx
```

## Troubleshooting

### Pipeline Fails at Test Stage
- Check test database connection
- Verify environment variables in workflow
- Review test logs in GitHub Actions

### Pipeline Fails at Deploy Stage
- Verify SSH connection: `ssh -i ~/.ssh/github-actions your-user@your-server-ip`
- Check server disk space: `df -h`
- Review deployment logs

### Application Not Starting
```bash
# Check container logs
docker-compose logs clinic-api

# Check database connection
docker-compose exec clinic-api node -e "require('./src/config/database').query('SELECT 1')"

# Restart services
docker-compose restart
```

### Rollback Not Working
```bash
# List available backups
ls -lh /opt/clinic-saas_backups/

# Manual restore
cd /opt/clinic-saas
docker-compose down
rm -rf *
cp -r /opt/clinic-saas_backups/BACKUP_TIMESTAMP/* .
docker-compose up -d
```

## Security Best Practices

1. **SSH Keys**: Use separate SSH keys for CI/CD, rotate regularly
2. **Secrets**: Never commit secrets to repository
3. **Firewall**: Configure UFW to allow only necessary ports
4. **SSL**: Use Let's Encrypt for production SSL certificates
5. **Backups**: Keep encrypted backups off-site
6. **Updates**: Regularly update system packages and Docker images

## Firewall Configuration

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application port (if needed)
sudo ufw allow 3000/tcp

# Check status
sudo ufw status
```

## Performance Optimization

### Docker Resource Limits
Edit `docker-compose.yml`:
```yaml
services:
  clinic-api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Database Optimization
```bash
# Monitor database performance
docker exec -it clinic-db mysql -u root -p -e "SHOW PROCESSLIST;"

# Optimize tables
docker exec -it clinic-db mysql -u root -p clinic_saas -e "OPTIMIZE TABLE patients, appointments, visits;"
```

## Support

- **Documentation**: Check `/docs` directory
- **Issues**: Create GitHub issue
- **Logs**: Always include relevant logs when reporting issues

## Next Steps

1. Set up monitoring (e.g., Prometheus, Grafana)
2. Configure automated database backups
3. Set up log aggregation (e.g., ELK stack)
4. Implement blue-green deployment
5. Add staging environment
