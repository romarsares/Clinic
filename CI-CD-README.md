# 🚀 CuraOne CI/CD Pipeline

## Quick Links

📖 **[5-Minute Setup](docs/QUICK-START-CICD.md)** | 📋 **[Complete Guide](docs/CI-CD-SETUP.md)** | ✅ **[Checklist](docs/CI-CD-CHECKLIST.md)** | 🐛 **[Troubleshooting](docs/CI-CD-TROUBLESHOOTING.md)**

---

## 🎯 What You Get

```
┌─────────────────────────────────────────────────────────────┐
│                    Automated CI/CD Pipeline                  │
├─────────────────────────────────────────────────────────────┤
│  ✅ Automated Testing                                        │
│  ✅ Automated Deployment                                     │
│  ✅ Automatic Backups                                        │
│  ✅ Automatic Rollback on Failure                           │
│  ✅ Health Monitoring                                        │
│  ✅ Zero-Downtime Deployment                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### 1️⃣ Server Setup (5 minutes)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N ""
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions  # Copy this for GitHub

# Setup app
sudo mkdir -p /opt/clinic-saas && sudo chown $USER:$USER /opt/clinic-saas
cd /opt/clinic-saas
git clone https://github.com/YOUR-USERNAME/Clinic.git .
cp config/.env.example .env && nano .env
chmod +x scripts/*.sh
./scripts/deploy-ubuntu.sh
```

### 2️⃣ GitHub Setup (2 minutes)

**Repository → Settings → Secrets → Actions**

Add:
- `SSH_PRIVATE_KEY` → Private key from step 1
- `SERVER_HOST` → Your server IP
- `SERVER_USER` → Your username

### 3️⃣ Deploy! (1 minute)

```bash
git push origin main
```

Watch it deploy automatically in **GitHub → Actions** 🎉

---

## 📊 Pipeline Flow

```
┌──────────────┐
│ Git Push     │
│ to main      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         GitHub Actions                    │
├──────────────────────────────────────────┤
│  Stage 1: Test                           │
│  ├─ Lint code                            │
│  ├─ Run tests                            │
│  └─ Build check                          │
│                                          │
│  Stage 2: Build                          │
│  ├─ Install dependencies                 │
│  └─ Build application                    │
│                                          │
│  Stage 3: Deploy (main only)             │
│  └─ Deploy to Ubuntu server              │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         Ubuntu Server                     │
├──────────────────────────────────────────┤
│  1. Create backup                        │
│  2. Pull latest code                     │
│  3. Install dependencies                 │
│  4. Run migrations                       │
│  5. Restart containers                   │
│  6. Health check                         │
│     ├─ ✅ Success → Done                 │
│     └─ ❌ Failure → Rollback             │
└──────────────────────────────────────────┘
```

---

## 🛠️ Management Commands

```bash
# SSH to your server
ssh your-user@your-server-ip

# Quick commands
./scripts/cicd.sh status      # Check status
./scripts/cicd.sh logs        # View logs
./scripts/cicd.sh health      # Health check
./scripts/cicd.sh restart     # Restart services
./scripts/cicd.sh db-backup   # Backup database
./scripts/cicd.sh clean       # Clean old resources

# Deployment commands
./scripts/deploy-ci-cd.sh deploy    # Manual deploy
./scripts/deploy-ci-cd.sh rollback  # Rollback
./scripts/deploy-ci-cd.sh backup    # Backup only
```

---

## 📁 What Was Created

### GitHub Actions Workflows
```
.github/workflows/
├── ci-cd.yml           # Main production pipeline
├── staging.yml         # Staging environment
└── pr-validation.yml   # Pull request checks
```

### Deployment Scripts
```
scripts/
├── deploy-ci-cd.sh     # Enhanced deployment with rollback
├── cicd.sh             # Quick management commands
└── deploy-ubuntu.sh    # Original deployment script
```

### Documentation
```
docs/
├── QUICK-START-CICD.md        # 5-minute setup
├── CI-CD-SETUP.md             # Complete guide
├── CI-CD-CHECKLIST.md         # Step-by-step checklist
├── CI-CD-IMPLEMENTATION.md    # Technical details
└── CI-CD-TROUBLESHOOTING.md   # Problem solving
```

---

## 🔧 Configuration

### GitHub Secrets

| Secret | Value |
|--------|-------|
| `SSH_PRIVATE_KEY` | SSH private key for server |
| `SERVER_HOST` | Server IP (e.g., 192.168.1.100) |
| `SERVER_USER` | SSH username (e.g., ubuntu) |

### Server Environment (.env)

```bash
# Database
MYSQL_ROOT_PASSWORD=secure-password
DB_PASSWORD=secure-password
DB_HOST=clinic-db

# Application
NODE_ENV=production
JWT_SECRET=your-32-char-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key

# Redis
REDIS_URL=redis://clinic-redis:6379
```

---

## 🎓 Workflow

### Development
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... code ...

# 3. Test locally
npm test

# 4. Push and create PR
git push origin feature/new-feature
```

### Staging (Optional)
```bash
# Merge to develop
git checkout develop
git merge feature/new-feature
git push origin develop
# → Automatically deploys to staging
```

### Production
```bash
# Merge to main
git checkout main
git merge develop
git push origin main
# → Automatically deploys to production
```

---

## 🔍 Monitoring

### Check Status
```bash
./scripts/cicd.sh status
```

Output:
```
=== Container Status ===
NAME            STATUS          PORTS
clinic-api      Up 2 hours      0.0.0.0:3000->3000/tcp
clinic-db       Up 2 hours      0.0.0.0:3306->3306/tcp
clinic-redis    Up 2 hours      0.0.0.0:6379->6379/tcp
clinic-nginx    Up 2 hours      0.0.0.0:80->80/tcp, 443/tcp
```

### View Logs
```bash
./scripts/cicd.sh logs
```

### Health Check
```bash
./scripts/cicd.sh health
# ✅ Application is healthy
```

---

## 🐛 Troubleshooting

### Pipeline Fails?
1. Check GitHub Actions logs
2. Verify SSH connection: `ssh -i ~/.ssh/github-actions user@server`
3. Check server logs: `./scripts/cicd.sh logs`

### App Not Starting?
```bash
docker-compose ps              # Check status
docker-compose logs clinic-api # Check logs
docker-compose restart         # Restart
```

### Need to Rollback?
```bash
./scripts/deploy-ci-cd.sh rollback
```

**Full troubleshooting guide**: [CI-CD-TROUBLESHOOTING.md](docs/CI-CD-TROUBLESHOOTING.md)

---

## 🔒 Security

- ✅ SSH key authentication (no passwords)
- ✅ Automated backups before deployment
- ✅ Secrets stored in GitHub (encrypted)
- ✅ Firewall configured
- ✅ SSL/TLS encryption
- ✅ Automatic rollback on failure

---

## 📈 Benefits

### For Developers
- ✅ Push to deploy
- ✅ Automated testing
- ✅ Quick feedback
- ✅ Easy rollback

### For Operations
- ✅ Zero-downtime deployment
- ✅ Automatic backups
- ✅ Health monitoring
- ✅ Simplified management

### For Business
- ✅ Faster releases
- ✅ Fewer errors
- ✅ Better reliability
- ✅ Lower costs

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK-START-CICD.md](docs/QUICK-START-CICD.md) | Get started in 5 minutes |
| [CI-CD-SETUP.md](docs/CI-CD-SETUP.md) | Complete setup guide |
| [CI-CD-CHECKLIST.md](docs/CI-CD-CHECKLIST.md) | Step-by-step checklist |
| [CI-CD-IMPLEMENTATION.md](docs/CI-CD-IMPLEMENTATION.md) | Technical details |
| [CI-CD-TROUBLESHOOTING.md](docs/CI-CD-TROUBLESHOOTING.md) | Problem solving |

---

## 🎯 Next Steps

1. ✅ **Setup CI/CD** - Follow [QUICK-START-CICD.md](docs/QUICK-START-CICD.md)
2. ⬜ **Configure Staging** - Setup staging environment
3. ⬜ **Setup Monitoring** - Add Prometheus/Grafana
4. ⬜ **Configure Alerts** - Email/Slack notifications
5. ⬜ **SSL Certificates** - Let's Encrypt for production
6. ⬜ **Log Aggregation** - ELK stack or similar

---

## 💡 Tips

- Always test locally before pushing
- Use feature branches for development
- Deploy to staging before production
- Monitor logs after deployment
- Keep backups for at least 5 deployments
- Review security settings regularly

---

## 📞 Support

- **Quick Help**: `./scripts/cicd.sh help`
- **Documentation**: Check `/docs` directory
- **Issues**: GitHub Issues
- **Logs**: `./scripts/cicd.sh logs`

---

## ✅ Success Checklist

Your CI/CD is working when:

- [ ] Tests pass in GitHub Actions
- [ ] Deployment completes automatically
- [ ] Application is accessible
- [ ] Health checks pass
- [ ] Rollback works
- [ ] Backups are created

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2024

---

## 🚀 Ready to Deploy?

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

Watch the magic happen! 🎉

---

For detailed instructions, start with: **[docs/QUICK-START-CICD.md](docs/QUICK-START-CICD.md)**
