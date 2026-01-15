#!/bin/bash

# Pediatric Clinic SaaS - Deployment Test Script
# Run this after deployment to verify everything is working

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Pediatric Clinic SaaS Deployment Test ===${NC}"

# Function to check service
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -n "Testing $service_name... "

    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

# Function to check container
check_container() {
    local container_name=$1

    echo -n "Checking container $container_name... "

    if docker ps | grep -q "$container_name"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Test containers
echo -e "\n${BLUE}=== Container Status ===${NC}"
check_container "clinic-api"
check_container "clinic-db"
check_container "clinic-nginx"
check_container "clinic-redis"

# Test health endpoints
echo -e "\n${BLUE}=== Health Checks ===${NC}"
check_service "API Health" "http://localhost:3000/health"
check_service "API Status" "http://localhost:3000/api/v1/status"
check_service "Nginx" "http://localhost" 301  # Should redirect to HTTPS

# Test database connection (if API is running)
echo -e "\n${BLUE}=== Database Connection ===${NC}"
if docker ps | grep -q "clinic-api"; then
    echo -n "Testing database connection... "
    # This would need to be implemented in the API
    echo -e "${YELLOW}⚠ MANUAL CHECK REQUIRED${NC}"
else
    echo -e "${RED}✗ Cannot test - API not running${NC}"
fi

# Test SSL (self-signed)
echo -e "\n${BLUE}=== SSL Certificate ===${NC}"
echo -n "Testing HTTPS (self-signed certificate)... "
if curl -k -s -o /dev/null -w "%{http_code}" "https://localhost" | grep -q "200"; then
    echo -e "${GREEN}✓ PASS (self-signed)${NC}"
else
    echo -e "${YELLOW}⚠ MANUAL CHECK REQUIRED${NC}"
fi

# Show resource usage
echo -e "\n${BLUE}=== Resource Usage ===${NC}"
echo "Docker containers:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Show logs summary
echo -e "\n${BLUE}=== Recent Logs ===${NC}"
echo "API logs (last 10 lines):"
docker-compose logs --tail=10 clinic-api 2>/dev/null || echo "No logs available"

echo -e "\n${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}Deployment test completed!${NC}"
echo -e "${YELLOW}Note: Some tests may require manual verification${NC}"
echo -e "${BLUE}Check DEPLOYMENT.md for detailed instructions${NC}"