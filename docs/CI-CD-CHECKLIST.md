# CI/CD Setup Checklist

Use this checklist to ensure proper CI/CD setup for CuraOne.

## ☑️ Pre-Setup Checklist

- [ ] Ubuntu server is accessible via SSH
- [ ] You have sudo/root access on the server
- [ ] GitHub repository is created and accessible
- [ ] You have admin access to GitHub repository
- [ ] Server has minimum 2GB RAM and 20GB disk space
- [ ] Server has a static IP or domain name

## ☑️ Server Setup (Ubuntu)

### 1. System Preparation
- [ ] SSH into your Ubuntu server
- [ ] Update system packages: `sudo apt update && sudo apt upgrade -y`
- [ ] Install required tools: `sudo apt install -y git curl wget`

### 2. Docker Installation
- [ ] Install Docker: `curl -fsSL https://get.docker.com | sudo sh`
- [ ] Add user to docker group: `sudo usermod -aG docker $USER`
- [ ] Log out and back in for group changes to take effect
- [ ] Verify Docker: `docker --version`
- [ ] Install Docker Compose: 
  ```bash
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```
- [ ] Verify Docker Compose: `docker-compose --version`

### 3. SSH Key Generation
- [ ] Generate SSH key: `ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N ""`
- [ ] Add public key to authorized_keys: `cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys`
- [ ] Set correct permissions: `chmod 600 ~/.ssh/github-actions`
- [ ] Copy private key content: `cat ~/.ssh/github-actions` (save this for GitHub)

### 4. Application Directory Setup
- [ ] Create app directory: `sudo mkdir -p /opt/clinic-saas`
- [ ] Set ownership: `sudo chown $USER:$USER /opt/clinic-saas`
- [ ] Create backup directory: `sudo mkdir -p /opt/clinic-saas_backups`
- [ ] Set ownership: `sudo chown $USER:$USER /opt/clinic-saas_backups`

### 5. Clone Repository
- [ ] Navigate to app directory: `cd /opt/clinic-saas`
- [ ] Clone repository: `git clone https://github.com/YOUR-USERNAME/Clinic.git .`
- [ ] Verify files: `ls -la`

### 6. Environment Configuration
- [ ] Copy example env: `cp config/.env.example .env`
- [ ] Edit .env file: `nano .env`
- [ ] Set secure passwords for:
  - [ ] MYSQL_ROOT_PASSWORD
  - [ ] DB_PASSWORD
  - [ ] JWT_SECRET (minimum 32 characters)
  - [ ] ENCRYPTION_KEY (exactly 32 characters)
- [ ] Save and exit

### 7. Make Scripts Executable
- [ ] `chmod +x scripts/deploy-ubuntu.sh`
- [ ] `chmod +x scripts/deploy-ci-cd.sh`
- [ ] `chmod +x scripts/cicd.sh`
- [ ] `chmod +x scripts/test-deployment.sh`

### 8. Initial Deployment
- [ ] Run deployment: `./scripts/deploy-ubuntu.sh`
- [ ] Wait for completion (may take 5-10 minutes)
- [ ] Verify containers: `docker-compose ps`
- [ ] Check health: `curl http://localhost:3000/health`

### 9. Firewall Configuration
- [ ] Enable firewall: `sudo ufw enable`
- [ ] Allow SSH: `sudo ufw allow 22/tcp`
- [ ] Allow HTTP: `sudo ufw allow 80/tcp`
- [ ] Allow HTTPS: `sudo ufw allow 443/tcp`
- [ ] Allow app port: `sudo ufw allow 3000/tcp`
- [ ] Check status: `sudo ufw status`

## ☑️ GitHub Configuration

### 1. Repository Secrets
- [ ] Go to: Repository → Settings → Secrets and variables → Actions
- [ ] Click "New repository secret"
- [ ] Add `SSH_PRIVATE_KEY`:
  - Name: `SSH_PRIVATE_KEY`
  - Value: Paste the private key from server (from `cat ~/.ssh/github-actions`)
- [ ] Add `SERVER_HOST`:
  - Name: `SERVER_HOST`
  - Value: Your server IP (e.g., `192.168.1.100`)
- [ ] Add `SERVER_USER`:
  - Name: `SERVER_USER`
  - Value: Your SSH username (e.g., `ubuntu`)

### 2. Optional: Staging Secrets (if using staging)
- [ ] Add `STAGING_SSH_PRIVATE_KEY`
- [ ] Add `STAGING_SERVER_HOST`
- [ ] Add `STAGING_SERVER_USER`

### 3. Verify Workflows
- [ ] Check `.github/workflows/ci-cd.yml` exists
- [ ] Check `.github/workflows/staging.yml` exists
- [ ] Check `.github/workflows/pr-validation.yml` exists

## ☑️ Testing CI/CD Pipeline

### 1. Test SSH Connection
- [ ] From your local machine: `ssh -i ~/.ssh/github-actions your-user@your-server-ip`
- [ ] Should connect without password
- [ ] Exit: `exit`

### 2. Test Manual Deployment
- [ ] SSH to server
- [ ] Run: `cd /opt/clinic-saas && ./scripts/deploy-ci-cd.sh deploy`
- [ ] Verify success
- [ ] Check health: `./scripts/cicd.sh health`

### 3. Test Automated Deployment
- [ ] On local machine, make a small change (e.g., update README)
- [ ] Commit: `git add . && git commit -m "Test CI/CD pipeline"`
- [ ] Push: `git push origin main`
- [ ] Go to GitHub → Actions tab
- [ ] Watch the pipeline run
- [ ] Verify all stages pass (Test → Build → Deploy)
- [ ] SSH to server and verify deployment: `./scripts/cicd.sh status`

### 4. Test Rollback
- [ ] SSH to server
- [ ] Run: `./scripts/deploy-ci-cd.sh rollback`
- [ ] Verify rollback successful
- [ ] Check health: `./scripts/cicd.sh health`

## ☑️ Post-Setup Verification

### 1. Application Health
- [ ] Check containers: `docker-compose ps` (all should be "Up")
- [ ] Check logs: `./scripts/cicd.sh logs`
- [ ] Test health endpoint: `curl http://localhost:3000/health`
- [ ] Test API: `curl http://localhost:3000/api/health`

### 2. Database
- [ ] Connect to database: `docker exec -it clinic-db mysql -u root -p clinic_saas`
- [ ] List tables: `SHOW TABLES;`
- [ ] Exit: `exit`

### 3. Backups
- [ ] Check backup directory: `ls -lh /opt/clinic-saas_backups/`
- [ ] Should see at least one backup
- [ ] Test manual backup: `./scripts/cicd.sh db-backup`

### 4. Monitoring
- [ ] View logs: `./scripts/cicd.sh logs`
- [ ] Check status: `./scripts/cicd.sh status`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`

## ☑️ Security Hardening

### 1. SSH Security
- [ ] Disable password authentication (optional but recommended):
  ```bash
  sudo nano /etc/ssh/sshd_config
  # Set: PasswordAuthentication no
  sudo systemctl restart sshd
  ```
- [ ] Change default SSH port (optional):
  ```bash
  sudo nano /etc/ssh/sshd_config
  # Set: Port 2222
  sudo systemctl restart sshd
  sudo ufw allow 2222/tcp
  ```

### 2. SSL Certificates
- [ ] Install Certbot: `sudo apt install -y certbot`
- [ ] Get certificate: `sudo certbot certonly --standalone -d your-domain.com`
- [ ] Update nginx config with real certificates
- [ ] Setup auto-renewal: `sudo certbot renew --dry-run`

### 3. Database Security
- [ ] Change default MySQL root password
- [ ] Create separate database user for application
- [ ] Restrict database access to localhost only

### 4. Application Security
- [ ] Verify JWT_SECRET is strong (32+ characters)
- [ ] Verify ENCRYPTION_KEY is exactly 32 characters
- [ ] Enable rate limiting in application
- [ ] Review and update CORS settings

## ☑️ Monitoring & Maintenance Setup

### 1. Log Rotation
- [ ] Verify logrotate config exists: `ls /etc/logrotate.d/clinic-saas`
- [ ] Test logrotate: `sudo logrotate -f /etc/logrotate.d/clinic-saas`

### 2. Automated Backups
- [ ] Setup daily database backup cron job:
  ```bash
  crontab -e
  # Add: 0 2 * * * /opt/clinic-saas/scripts/cicd.sh db-backup
  ```
- [ ] Verify cron job: `crontab -l`

### 3. System Updates
- [ ] Enable automatic security updates:
  ```bash
  sudo apt install -y unattended-upgrades
  sudo dpkg-reconfigure -plow unattended-upgrades
  ```

### 4. Monitoring (Optional)
- [ ] Setup monitoring solution (Prometheus, Grafana, etc.)
- [ ] Configure alerting (email, Slack, etc.)
- [ ] Setup uptime monitoring

## ☑️ Documentation

- [ ] Update README with your server details
- [ ] Document any custom configurations
- [ ] Share access credentials with team (securely)
- [ ] Create runbook for common operations

## ☑️ Team Onboarding

- [ ] Share GitHub repository access
- [ ] Share server access (if needed)
- [ ] Share documentation links
- [ ] Conduct walkthrough of CI/CD process

## 🎉 Completion Checklist

- [ ] All tests pass in GitHub Actions
- [ ] Application is accessible via browser
- [ ] Database is properly configured
- [ ] Backups are working
- [ ] Monitoring is in place
- [ ] Team is trained
- [ ] Documentation is complete

## 📝 Notes

**Server IP**: ___________________

**GitHub Repository**: ___________________

**Deployment Date**: ___________________

**Team Members with Access**:
- ___________________
- ___________________
- ___________________

**Important Passwords Stored In**:
- [ ] Password manager
- [ ] Secure vault
- [ ] Team documentation (encrypted)

---

## 🆘 If Something Goes Wrong

1. **Check logs**: `./scripts/cicd.sh logs`
2. **Check status**: `./scripts/cicd.sh status`
3. **Rollback**: `./scripts/deploy-ci-cd.sh rollback`
4. **Restart**: `./scripts/cicd.sh restart`
5. **Contact**: [Your support contact]

## 📚 Quick Reference

```bash
# Common commands
./scripts/cicd.sh status    # Check status
./scripts/cicd.sh logs      # View logs
./scripts/cicd.sh health    # Health check
./scripts/cicd.sh deploy    # Manual deploy
./scripts/cicd.sh rollback  # Rollback
./scripts/cicd.sh db-backup # Backup database
```

---

**Setup completed**: ☐ Yes ☐ No

**Verified by**: ___________________

**Date**: ___________________
