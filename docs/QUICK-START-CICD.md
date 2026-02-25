# Quick Start: CI/CD Setup for Ubuntu Server

## 🚀 5-Minute Setup

### On Your Ubuntu Server

```bash
# 1. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 2. Create SSH key for GitHub Actions
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N ""
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# 3. Show private key (copy this for GitHub)
cat ~/.ssh/github-actions

# 4. Setup application directory
sudo mkdir -p /opt/clinic-saas
sudo chown $USER:$USER /opt/clinic-saas
cd /opt/clinic-saas

# 5. Clone repository
git clone https://github.com/YOUR-USERNAME/Clinic.git .

# 6. Create environment file
cp config/.env.example .env
nano .env  # Edit with your settings

# 7. Make scripts executable
chmod +x scripts/*.sh

# 8. Run initial deployment
./scripts/deploy-ubuntu.sh
```

### On GitHub

1. Go to: **Repository → Settings → Secrets → Actions**
2. Add these secrets:
   - `SSH_PRIVATE_KEY`: Paste the private key from step 3 above
   - `SERVER_HOST`: Your server IP (e.g., `192.168.1.100`)
   - `SERVER_USER`: Your username (e.g., `ubuntu`)

### Test It

```bash
# On your local machine
git add .
git commit -m "Setup CI/CD"
git push origin main
```

Watch the magic happen in **GitHub → Actions** tab! 🎉

## 📋 What You Get

- ✅ Automated testing on every push
- ✅ Automatic deployment to your server
- ✅ Automatic backups before deployment
- ✅ Automatic rollback on failure
- ✅ Health checks after deployment

## 🛠️ Common Commands

```bash
# SSH into your server
ssh your-user@your-server-ip

# View logs
cd /opt/clinic-saas
docker-compose logs -f

# Check status
docker-compose ps

# Manual deployment
./scripts/deploy-ci-cd.sh deploy

# Rollback
./scripts/deploy-ci-cd.sh rollback

# Quick commands
./scripts/cicd.sh status
./scripts/cicd.sh logs
./scripts/cicd.sh health
```

## 🔒 Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Setup firewall: `sudo ufw enable && sudo ufw allow 22,80,443/tcp`
- [ ] Use strong SSH keys
- [ ] Enable automatic security updates
- [ ] Setup SSL certificates (Let's Encrypt)

## 📚 Full Documentation

See [CI-CD-SETUP.md](./CI-CD-SETUP.md) for complete documentation.

## 🆘 Troubleshooting

**Pipeline fails?**
- Check GitHub Actions logs
- Verify SSH connection: `ssh -i ~/.ssh/github-actions user@server`
- Check server disk space: `df -h`

**App not starting?**
```bash
docker-compose logs clinic-api
docker-compose restart
```

**Need help?**
- Check logs: `./scripts/cicd.sh logs`
- View status: `./scripts/cicd.sh status`
- Health check: `./scripts/cicd.sh health`
