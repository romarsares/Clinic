#!/bin/bash

# CuraOne - Enhanced CI/CD Deployment Script
# Supports automated deployment with rollback capability

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="clinic-saas"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/${APP_NAME}_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
MAX_BACKUPS=5

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Create backup before deployment
create_backup() {
    log_info "Creating backup..."
    mkdir -p "$BACKUP_PATH"
    
    if [ -d "$APP_DIR" ]; then
        cp -r "$APP_DIR"/* "$BACKUP_PATH/" 2>/dev/null || true
        
        # Backup database
        if docker ps | grep -q clinic-db; then
            log_info "Backing up database..."
            docker exec clinic-db mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" clinic_saas > "$BACKUP_PATH/database.sql" 2>/dev/null || true
        fi
        
        log_success "Backup created at $BACKUP_PATH"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    cd "$BACKUP_DIR"
    ls -t | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -rf
    log_success "Old backups cleaned up"
}

# Pull latest code
pull_latest_code() {
    log_info "Pulling latest code from repository..."
    cd "$APP_DIR"
    
    git fetch origin
    git reset --hard origin/main
    
    log_success "Code updated successfully"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    cd "$APP_DIR"
    npm ci --production
    log_success "Dependencies installed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Check if migrations directory exists
    if [ -d "$APP_DIR/migrations" ]; then
        for migration in "$APP_DIR/migrations"/*.sql; do
            if [ -f "$migration" ]; then
                log_info "Running migration: $(basename $migration)"
                docker exec -i clinic-db mysql -u root -p"${MYSQL_ROOT_PASSWORD}" clinic_saas < "$migration" || log_warning "Migration may have already been applied"
            fi
        done
    fi
    
    log_success "Migrations completed"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    cd "$APP_DIR"
    
    # Stop existing containers
    docker-compose down
    
    # Build and start new containers
    docker-compose up -d --build
    
    log_success "Application deployed"
}

# Health check
health_check() {
    log_info "Running health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Waiting for application to start... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "Health check failed"
    return 1
}

# Rollback to previous version
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Find the most recent backup (excluding current one)
    PREVIOUS_BACKUP=$(ls -t "$BACKUP_DIR" | head -n 2 | tail -n 1)
    
    if [ -z "$PREVIOUS_BACKUP" ]; then
        log_error "No previous backup found for rollback"
        return 1
    fi
    
    log_info "Restoring from backup: $PREVIOUS_BACKUP"
    
    # Stop current containers
    cd "$APP_DIR"
    docker-compose down
    
    # Restore files
    rm -rf "$APP_DIR"/*
    cp -r "$BACKUP_DIR/$PREVIOUS_BACKUP"/* "$APP_DIR/"
    
    # Restore database if backup exists
    if [ -f "$BACKUP_DIR/$PREVIOUS_BACKUP/database.sql" ]; then
        log_info "Restoring database..."
        docker-compose up -d clinic-db
        sleep 10
        docker exec -i clinic-db mysql -u root -p"${MYSQL_ROOT_PASSWORD}" clinic_saas < "$BACKUP_DIR/$PREVIOUS_BACKUP/database.sql"
    fi
    
    # Start containers
    docker-compose up -d
    
    log_success "Rollback completed"
}

# Main deployment function
main() {
    log_info "Starting CuraOne deployment..."
    log_info "Timestamp: $TIMESTAMP"
    
    # Load environment variables
    if [ -f "$APP_DIR/.env" ]; then
        export $(cat "$APP_DIR/.env" | grep -v '^#' | xargs)
    fi
    
    # Create backup
    create_backup
    
    # Deploy
    if pull_latest_code && \
       install_dependencies && \
       run_migrations && \
       deploy_application && \
       health_check; then
        
        log_success "Deployment completed successfully!"
        cleanup_old_backups
        
        # Display application info
        echo ""
        log_info "Application Status:"
        docker-compose ps
        echo ""
        log_info "Recent logs:"
        docker-compose logs --tail=20 clinic-api
        
    else
        log_error "Deployment failed!"
        log_warning "Initiating rollback..."
        
        if rollback && health_check; then
            log_success "Rollback successful"
            exit 1
        else
            log_error "Rollback failed! Manual intervention required."
            exit 2
        fi
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        health_check
        ;;
    backup)
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|backup}"
        exit 1
        ;;
esac
