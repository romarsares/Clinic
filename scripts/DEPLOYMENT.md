# Pediatric Clinic SaaS - Deployment Guide

## Local Ubuntu Server Deployment

This guide will help you deploy the Pediatric Clinic SaaS application to your local Ubuntu server for testing and development.

### Prerequisites

- Ubuntu 20.04 or later
- At least 4GB RAM, 2 CPU cores, 20GB storage
- Root or sudo access
- Internet connection

### Quick Deployment

1. **Clone the repository on your Ubuntu server:**
   ```bash
   git clone https://github.com/your-username/clinic.git /opt/clinic-saas
   cd /opt/clinic-saas
   ```

2. **Make the deployment script executable:**
   ```bash
   chmod +x deploy-ubuntu.sh
   ```

3. **Run the deployment script:**
   ```bash
   ./deploy-ubuntu.sh
   ```

4. **Check deployment status:**
   ```bash
   cd /opt/clinic-saas
   docker-compose ps
   docker-compose logs
   ```

### Manual Deployment Steps

If you prefer to deploy manually:

1. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose nodejs npm git
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   nano .env
   ```

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

### Access the Application

- **API Health Check:** http://localhost:3000/health
- **API Status:** http://localhost:3000/api/v1/status
- **Web Interface:** https://localhost (accepts self-signed certificate)

### Post-Deployment Configuration

1. **Update Environment Variables:**
   - Change default passwords in `.env`
   - Set secure JWT and encryption keys
   - Configure email/SMS providers

2. **SSL Certificates:**
   - Replace self-signed certificates with real ones
   - Update Nginx configuration for production domains

3. **Database Setup:**
   - Run database migrations (when implemented)
   - Create initial admin user

4. **Security Hardening:**
   - Configure firewall (ufw)
   - Set up log rotation
   - Enable fail2ban

### Monitoring & Maintenance

- **View logs:** `docker-compose logs -f`
- **Restart services:** `docker-compose restart`
- **Update deployment:** `git pull && docker-compose up -d --build`
- **Backup data:** `docker-compose exec clinic-db mysqldump clinic_saas > backup.sql`

### Troubleshooting

1. **Check container status:**
   ```bash
   docker-compose ps
   ```

2. **View service logs:**
   ```bash
   docker-compose logs clinic-api
   ```

3. **Restart failed services:**
   ```bash
   docker-compose restart clinic-api
   ```

4. **Rebuild and redeploy:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

### Production Considerations

For production deployment:

1. Use external managed database (AWS RDS, Google Cloud SQL)
2. Set up proper SSL certificates (Let's Encrypt)
3. Configure load balancer
4. Implement monitoring (Prometheus, Grafana)
5. Set up automated backups
6. Configure firewall and security groups
7. Enable log aggregation
8. Set up CI/CD pipeline for automated deployments

### Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables in `.env`
3. Ensure ports 80, 443, 3000, 3306, 6379 are available
4. Check Docker and Docker Compose versions

For healthcare production deployments, ensure compliance with PH Data Privacy Act and implement additional security measures.