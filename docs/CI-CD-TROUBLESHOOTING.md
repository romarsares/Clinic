# CI/CD Troubleshooting Guide

## 🔍 Quick Diagnostics

Run these commands first to identify the issue:

```bash
# On your server
./scripts/cicd.sh status    # Check container status
./scripts/cicd.sh health    # Check application health
./scripts/cicd.sh logs      # View recent logs
df -h                       # Check disk space
free -h                     # Check memory
docker ps                   # Check running containers
```

---

## 🚨 Common Issues & Solutions

### 1. GitHub Actions Pipeline Fails

#### Issue: Test Stage Fails

**Symptoms:**
- Tests fail in GitHub Actions
- Build passes locally but fails in CI

**Solutions:**

```bash
# 1. Run tests locally with same environment
npm test

# 2. Check if test database is accessible
# In GitHub Actions, MySQL runs on 127.0.0.1:3306

# 3. Verify environment variables in workflow
# Check .github/workflows/ci-cd.yml

# 4. Check test logs in GitHub Actions
# Go to: Actions → Failed workflow → Test stage
```

**Common Causes:**
- Missing environment variables
- Database connection issues
- Test timeout
- Dependency issues

---

#### Issue: Deploy Stage Fails - SSH Connection

**Symptoms:**
- Error: "Permission denied (publickey)"
- Error: "Connection refused"

**Solutions:**

```bash
# 1. Test SSH connection manually
ssh -i ~/.ssh/github-actions your-user@your-server-ip

# 2. Verify SSH key in GitHub Secrets
# Go to: Settings → Secrets → SSH_PRIVATE_KEY
# Should be the PRIVATE key (not public)

# 3. Check authorized_keys on server
cat ~/.ssh/authorized_keys
# Should contain the PUBLIC key

# 4. Verify server is accessible
ping your-server-ip

# 5. Check SSH service on server
sudo systemctl status sshd

# 6. Check firewall
sudo ufw status
# Port 22 should be allowed
```

---

#### Issue: Deploy Stage Fails - Health Check

**Symptoms:**
- Deployment completes but health check fails
- Application not responding

**Solutions:**

```bash
# 1. SSH to server
ssh your-user@your-server-ip

# 2. Check container status
cd /opt/clinic-saas
docker-compose ps

# 3. Check application logs
docker-compose logs clinic-api

# 4. Check if port is accessible
curl http://localhost:3000/health

# 5. Check if containers are running
docker ps

# 6. Restart containers
docker-compose restart

# 7. Check database connection
docker-compose logs clinic-db
```

---

### 2. Application Not Starting

#### Issue: Container Exits Immediately

**Symptoms:**
- Container starts then stops
- Status shows "Exited (1)"

**Solutions:**

```bash
# 1. Check logs for error
docker-compose logs clinic-api

# 2. Common issues:

# Database connection error
# Fix: Check DB_HOST, DB_USER, DB_PASSWORD in .env

# Port already in use
# Fix: Check if another process is using port 3000
sudo lsof -i :3000
# Kill process: sudo kill -9 <PID>

# Missing environment variables
# Fix: Verify .env file exists and has all required variables
cat .env

# Permission issues
# Fix: Check file permissions
ls -la /opt/clinic-saas

# 3. Try starting manually
cd /opt/clinic-saas
docker-compose up clinic-api
# Watch for errors
```

---

#### Issue: Database Connection Failed

**Symptoms:**
- Error: "ECONNREFUSED"
- Error: "Access denied for user"

**Solutions:**

```bash
# 1. Check if database container is running
docker-compose ps clinic-db

# 2. Check database logs
docker-compose logs clinic-db

# 3. Verify database credentials
cat .env | grep DB_

# 4. Test database connection
docker exec -it clinic-db mysql -u root -p
# Enter password from .env

# 5. Check if database exists
docker exec -it clinic-db mysql -u root -p -e "SHOW DATABASES;"

# 6. Recreate database if needed
docker-compose down
docker volume rm clinic-saas_mysql-data
docker-compose up -d
```

---

### 3. Deployment Issues

#### Issue: Disk Space Full

**Symptoms:**
- Error: "No space left on device"
- Deployment fails during build

**Solutions:**

```bash
# 1. Check disk space
df -h

# 2. Clean Docker resources
docker system prune -a -f

# 3. Remove old backups
cd /opt/clinic-saas_backups
ls -lt | tail -n +6 | awk '{print $9}' | xargs rm -rf

# 4. Clean logs
sudo truncate -s 0 /var/log/clinic-saas/*.log

# 5. Remove unused Docker volumes
docker volume prune -f

# 6. Check largest directories
du -sh /opt/* | sort -h
```

---

#### Issue: Rollback Fails

**Symptoms:**
- Rollback command fails
- No previous backup found

**Solutions:**

```bash
# 1. Check available backups
ls -lh /opt/clinic-saas_backups/

# 2. If no backups exist, redeploy from git
cd /opt/clinic-saas
git fetch origin
git reset --hard origin/main
./scripts/deploy-ci-cd.sh deploy

# 3. If backup exists but rollback fails
# Manually restore
BACKUP_DIR="/opt/clinic-saas_backups/TIMESTAMP"
cd /opt/clinic-saas
docker-compose down
rm -rf *
cp -r $BACKUP_DIR/* .
docker-compose up -d

# 4. Restore database manually
docker exec -i clinic-db mysql -u root -p clinic_saas < $BACKUP_DIR/database.sql
```

---

### 4. Performance Issues

#### Issue: Application Slow

**Symptoms:**
- Slow response times
- High CPU/memory usage

**Solutions:**

```bash
# 1. Check resource usage
docker stats

# 2. Check container logs for errors
docker-compose logs --tail=100 clinic-api

# 3. Check database performance
docker exec -it clinic-db mysql -u root -p -e "SHOW PROCESSLIST;"

# 4. Restart services
docker-compose restart

# 5. Check system resources
top
free -h
df -h

# 6. Optimize database
docker exec -it clinic-db mysql -u root -p clinic_saas -e "OPTIMIZE TABLE patients, appointments, visits;"

# 7. Clear Redis cache
docker-compose restart clinic-redis
```

---

#### Issue: Database Slow

**Symptoms:**
- Slow queries
- High database CPU

**Solutions:**

```bash
# 1. Check slow query log
docker exec -it clinic-db cat /var/lib/mysql/mysql-slow.log

# 2. Analyze queries
docker exec -it clinic-db mysql -u root -p -e "SHOW FULL PROCESSLIST;"

# 3. Check database size
docker exec -it clinic-db mysql -u root -p -e "
SELECT 
    table_schema AS 'Database',
    SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;
"

# 4. Optimize tables
docker exec -it clinic-db mysql -u root -p clinic_saas -e "
OPTIMIZE TABLE patients;
OPTIMIZE TABLE appointments;
OPTIMIZE TABLE visits;
"

# 5. Add indexes if needed
# Check with your database schema
```

---

### 5. Network Issues

#### Issue: Cannot Access Application

**Symptoms:**
- Cannot reach application from browser
- Connection timeout

**Solutions:**

```bash
# 1. Check if application is running
docker-compose ps

# 2. Check if port is accessible locally
curl http://localhost:3000/health

# 3. Check firewall
sudo ufw status
# Ensure ports 80, 443, 3000 are allowed

# 4. Check nginx configuration
docker-compose logs clinic-nginx

# 5. Test from server
curl http://localhost:3000/health

# 6. Test from external
curl http://YOUR_SERVER_IP:3000/health

# 7. Check if nginx is forwarding correctly
docker-compose exec clinic-nginx nginx -t
```

---

### 6. SSL/HTTPS Issues

#### Issue: SSL Certificate Error

**Symptoms:**
- Browser shows "Not Secure"
- Certificate expired

**Solutions:**

```bash
# 1. Check certificate
openssl x509 -in /opt/clinic-saas/ssl/selfsigned.crt -text -noout

# 2. Regenerate self-signed certificate
cd /opt/clinic-saas
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/selfsigned.key \
    -out ssl/selfsigned.crt \
    -subj "/C=PH/ST=Metro Manila/L=Manila/O=Clinic/CN=YOUR_IP"

# 3. For production, use Let's Encrypt
sudo apt install -y certbot
sudo certbot certonly --standalone -d your-domain.com

# 4. Update nginx config with real certificates
# Edit config/nginx/nginx.conf

# 5. Restart nginx
docker-compose restart clinic-nginx
```

---

## 🛠️ Advanced Troubleshooting

### Enable Debug Mode

```bash
# 1. Edit .env
nano /opt/clinic-saas/.env

# 2. Add debug settings
NODE_ENV=development
LOG_LEVEL=debug

# 3. Restart application
docker-compose restart clinic-api

# 4. Watch logs
docker-compose logs -f clinic-api
```

---

### Check Container Health

```bash
# Inspect container
docker inspect clinic-api

# Check container resources
docker stats clinic-api

# Execute commands in container
docker exec -it clinic-api sh

# Inside container:
node -v
npm -v
ls -la
cat .env
```

---

### Database Debugging

```bash
# Connect to database
docker exec -it clinic-db mysql -u root -p clinic_saas

# Inside MySQL:
SHOW TABLES;
DESCRIBE patients;
SELECT COUNT(*) FROM patients;
SHOW PROCESSLIST;
SHOW VARIABLES LIKE 'max_connections';

# Check database logs
docker-compose logs clinic-db | grep ERROR
```

---

### Network Debugging

```bash
# Check container network
docker network ls
docker network inspect clinic-saas_default

# Check port bindings
docker port clinic-api
docker port clinic-db
docker port clinic-nginx

# Test connectivity between containers
docker exec clinic-api ping clinic-db
docker exec clinic-api nc -zv clinic-db 3306
```

---

## 📋 Diagnostic Checklist

When troubleshooting, check these in order:

- [ ] Containers are running: `docker-compose ps`
- [ ] No errors in logs: `docker-compose logs`
- [ ] Disk space available: `df -h`
- [ ] Memory available: `free -h`
- [ ] Database is accessible: `docker exec -it clinic-db mysql -u root -p`
- [ ] Application responds: `curl http://localhost:3000/health`
- [ ] Firewall allows traffic: `sudo ufw status`
- [ ] Environment variables set: `cat .env`
- [ ] Ports not in use: `sudo lsof -i :3000`

---

## 🆘 Emergency Procedures

### Complete System Reset

```bash
# WARNING: This will delete all data!

# 1. Stop all containers
cd /opt/clinic-saas
docker-compose down

# 2. Remove all volumes
docker volume rm $(docker volume ls -q | grep clinic)

# 3. Clean Docker
docker system prune -a -f

# 4. Restore from backup or redeploy
git fetch origin
git reset --hard origin/main
./scripts/deploy-ubuntu.sh
```

---

### Restore from Backup

```bash
# 1. List backups
ls -lh /opt/clinic-saas_backups/

# 2. Choose backup
BACKUP="20240101_120000"

# 3. Stop application
cd /opt/clinic-saas
docker-compose down

# 4. Restore files
rm -rf /opt/clinic-saas/*
cp -r /opt/clinic-saas_backups/$BACKUP/* /opt/clinic-saas/

# 5. Restore database
docker-compose up -d clinic-db
sleep 10
docker exec -i clinic-db mysql -u root -p clinic_saas < /opt/clinic-saas_backups/$BACKUP/database.sql

# 6. Start application
docker-compose up -d

# 7. Verify
./scripts/cicd.sh health
```

---

## 📞 Getting Help

### Collect Information

Before asking for help, collect:

```bash
# System info
uname -a
docker --version
docker-compose --version

# Application status
./scripts/cicd.sh status

# Recent logs
./scripts/cicd.sh logs > logs.txt

# Container info
docker-compose ps > containers.txt

# Resource usage
df -h > disk.txt
free -h > memory.txt
```

### Where to Get Help

1. **Documentation**: Check `/docs` directory
2. **Logs**: Review application and container logs
3. **GitHub Issues**: Search existing issues
4. **Community**: Ask in discussions

---

## 📝 Prevention Tips

### Regular Maintenance

```bash
# Weekly
./scripts/cicd.sh clean          # Clean old resources
./scripts/cicd.sh db-backup      # Backup database

# Monthly
sudo apt update && sudo apt upgrade -y
docker-compose pull              # Update images
```

### Monitoring

```bash
# Setup cron jobs for monitoring
crontab -e

# Add:
0 * * * * /opt/clinic-saas/scripts/cicd.sh health || echo "Health check failed" | mail -s "Alert" admin@example.com
0 2 * * * /opt/clinic-saas/scripts/cicd.sh db-backup
0 3 * * * /opt/clinic-saas/scripts/cicd.sh clean
```

---

**Last Updated**: $(date)
**Version**: 1.0.0
