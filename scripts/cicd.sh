#!/bin/bash

# CuraOne CI/CD Quick Commands
# Quick reference for common deployment operations

show_help() {
    cat << EOF
CuraOne CI/CD Management Script

Usage: ./cicd.sh [command]

Commands:
    status      - Show application status
    logs        - View application logs
    deploy      - Deploy latest version
    rollback    - Rollback to previous version
    backup      - Create manual backup
    restart     - Restart all services
    health      - Check application health
    db-backup   - Backup database only
    db-restore  - Restore database from backup
    clean       - Clean old Docker images and backups
    update      - Update system dependencies

Examples:
    ./cicd.sh status
    ./cicd.sh logs
    ./cicd.sh deploy
    ./cicd.sh rollback

EOF
}

APP_DIR="/opt/clinic-saas"
BACKUP_DIR="/opt/clinic-saas_backups"

case "${1:-help}" in
    status)
        echo "=== Container Status ==="
        cd "$APP_DIR" && docker-compose ps
        echo ""
        echo "=== Disk Usage ==="
        df -h | grep -E "Filesystem|/opt"
        echo ""
        echo "=== Memory Usage ==="
        free -h
        ;;
    
    logs)
        cd "$APP_DIR"
        if [ -z "$2" ]; then
            docker-compose logs --tail=100 -f
        else
            docker-compose logs --tail=100 -f "$2"
        fi
        ;;
    
    deploy)
        cd "$APP_DIR"
        ./scripts/deploy-ci-cd.sh deploy
        ;;
    
    rollback)
        cd "$APP_DIR"
        ./scripts/deploy-ci-cd.sh rollback
        ;;
    
    backup)
        cd "$APP_DIR"
        ./scripts/deploy-ci-cd.sh backup
        ;;
    
    restart)
        echo "Restarting all services..."
        cd "$APP_DIR"
        docker-compose restart
        echo "Services restarted"
        ;;
    
    health)
        echo "Checking application health..."
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            echo "✅ Application is healthy"
        else
            echo "❌ Application health check failed"
            exit 1
        fi
        ;;
    
    db-backup)
        echo "Creating database backup..."
        BACKUP_FILE="$BACKUP_DIR/manual_db_$(date +%Y%m%d_%H%M%S).sql"
        docker exec clinic-db mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" clinic_saas > "$BACKUP_FILE"
        echo "Database backed up to: $BACKUP_FILE"
        ;;
    
    db-restore)
        if [ -z "$2" ]; then
            echo "Usage: ./cicd.sh db-restore <backup-file>"
            echo "Available backups:"
            ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null || echo "No backups found"
            exit 1
        fi
        echo "Restoring database from: $2"
        docker exec -i clinic-db mysql -u root -p"${MYSQL_ROOT_PASSWORD}" clinic_saas < "$2"
        echo "Database restored"
        ;;
    
    clean)
        echo "Cleaning up old resources..."
        
        # Remove old Docker images
        docker image prune -a -f
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        
        echo "Cleanup completed"
        ;;
    
    update)
        echo "Updating system dependencies..."
        sudo apt update
        sudo apt upgrade -y
        
        echo "Updating Docker images..."
        cd "$APP_DIR"
        docker-compose pull
        
        echo "Update completed. Run './cicd.sh deploy' to apply changes"
        ;;
    
    help|*)
        show_help
        ;;
esac
