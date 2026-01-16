#!/bin/bash

# Pediatric Clinic SaaS - Local Ubuntu Server Deployment Script
# This script deploys the application to a local Ubuntu server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="clinic-saas"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/${APP_NAME}_backups"
LOG_DIR="/var/log/$APP_NAME"
SERVER_IP="1" # Your local server IP
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. This is not recommended for production."
    else
        log_info "Running with user privileges."
    fi
}

# Install system dependencies
install_dependencies() {
    log_info "Installing system dependencies..."

    # Update package list
    sudo apt update

    # Install Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io
        sudo systemctl start docker
        sudo systemctl enable docker
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_info "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi

    # Install Node.js (for local development/building)
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi

    # Install Git
    sudo apt install -y git curl wget

    log_success "System dependencies installed."
}

# Create necessary directories
create_directories() {
    log_info "Creating application directories..."

    sudo mkdir -p $APP_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $LOG_DIR
    sudo mkdir -p $APP_DIR/mysql-init
    sudo mkdir -p $APP_DIR/mysql-config
    sudo mkdir -p $APP_DIR/nginx
    sudo mkdir -p $APP_DIR/redis
    sudo mkdir -p $APP_DIR/ssl

    log_success "Directories created."

    log_info "Setting directory permissions..."
    sudo chown -R $USER:$USER $APP_DIR
    sudo chown -R $USER:$USER $BACKUP_DIR
    sudo chmod -R 755 $LOG_DIR
}

# Clone or update repository
setup_repository() {
    log_info "Setting up application repository..."

    if [ -d "$APP_DIR/.git" ]; then
        log_info "Repository exists, pulling latest changes..."
        cd "$APP_DIR"
        git pull origin main
    else
        log_info "Cloning repository..."
        git clone https://github.com/your-username/clinic.git $APP_DIR
        cd "$APP_DIR"
    fi

    log_success "Repository setup complete."
}

# Create environment configuration
create_env_file() {
    log_info "Creating environment configuration..."

    if [ ! -f "$APP_DIR/.env" ]; then
        cat > $APP_DIR/.env << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=root_pass_2024_secure_change_this
DB_PASSWORD=clinic_pass_2024_secure_change_this

# Application Configuration
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production-32-chars-minimum
ENCRYPTION_KEY=your-32-char-encryption-key-here-for-phi-data

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Redis Configuration (Optional)
REDIS_URL=redis://clinic-redis:6379

# Email/SMS Configuration (Add your providers)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/clinic-saas/app.log
EOF
        log_warning "Environment file created with default values. Please update sensitive information!"
    else
        log_info "Environment file already exists."
    fi
}

# Setup MySQL configuration
setup_mysql_config() {
    log_info "Setting up MySQL configuration..."

    cat > $APP_DIR/mysql-config/my.cnf << EOF
[mysqld]
# Basic settings
bind-address = 0.0.0.0
port = 3306

# Performance settings for small server
innodb_buffer_pool_size = 128M
innodb_log_file_size = 32M
max_connections = 100

# Security settings
skip-name-resolve
sql_mode = STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO

# Logging
general_log = 1
general_log_file = /var/lib/mysql/mysql.log
slow_query_log = 1
slow_query_log_file = /var/lib/mysql/mysql-slow.log
long_query_time = 2

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4

[client]
default-character-set = utf8mb4
EOF

    log_success "MySQL configuration created."
}

# Setup Nginx configuration
setup_nginx_config() {
    log_info "Setting up Nginx configuration..."

    cat > $APP_DIR/nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Upstream backend
    upstream clinic_backend {
        server clinic-api:3000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name $SERVER_IP;
        return 301 https://\$server_name\$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name $SERVER_IP;

        # SSL configuration (you'll need to add real certificates)
        ssl_certificate /etc/nginx/ssl/selfsigned.crt;
        ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # API proxy
        location /api/ {
            proxy_pass http://clinic_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 86400;
        }

        # Static files
        location / {
            proxy_pass http://clinic_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    log_success "Nginx configuration created."
}

# Create self-signed SSL certificates for testing
create_ssl_certificates() {
    log_info "Creating self-signed SSL certificates for testing..."

    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $APP_DIR/ssl/selfsigned.key \
        -out $APP_DIR/ssl/selfsigned.crt \
        -subj "/C=PH/ST=Metro Manila/L=Manila/O=Clinic SaaS/CN=$SERVER_IP"

    sudo chmod 600 $APP_DIR/ssl/selfsigned.key
    sudo chmod 644 $APP_DIR/ssl/selfsigned.crt

    log_success "SSL certificates created."
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."

    cd $APP_DIR

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down || true

    # Build and start containers
    log_info "Building and starting containers..."
    docker-compose up -d --build

    # Wait for services to be healthy
    log_info "Waiting for services to start..."
    sleep 30

    # Check container status
    log_info "Checking container status..."
    docker-compose ps

    log_success "Application deployed successfully!"
}

# Setup monitoring and logging
setup_monitoring() {
    log_info "Setting up basic monitoring..."

    # Create log rotation
    sudo cat > /etc/logrotate.d/clinic-saas << EOF
/var/log/clinic-saas/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f $APP_DIR/docker-compose.yml logs -f clinic-api > /dev/null 2>&1 || true
    endscript
}
EOF

    log_success "Monitoring setup complete."
}

# Main deployment function
main() {
    log_info "Starting Pediatric Clinic SaaS deployment on Ubuntu server..."
    log_info "Timestamp: $TIMESTAMP"

    check_permissions
    create_directories
    install_dependencies
    setup_repository
    create_env_file
    setup_mysql_config
    setup_nginx_config
    create_ssl_certificates
    deploy_application
    setup_monitoring

    log_success "Deployment completed successfully!"
    log_info ""
    log_info "Application should be available at:"
    log_info "  - API: http://$SERVER_IP:3000"
    log_info "  - Web: https://$SERVER_IP (with self-signed certificate)"
    log_info ""
    log_warning "Remember to:"
    log_warning "  1. Update .env file with secure passwords"
    log_warning "  2. Replace self-signed SSL certificates with real ones"
    log_warning "  3. Configure firewall rules"
    log_warning "  4. Set up proper backup procedures"
}

# Run main function
main "$@"