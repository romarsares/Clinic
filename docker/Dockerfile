# Pediatric Clinic SaaS - Docker Setup
# Multi-tenant Healthcare Management System

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application (if needed)
# RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S clinicapp -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=clinicapp:nodejs /app ./

# Copy healthcheck script
COPY --from=builder --chown=clinicapp:nodejs /app/tests/healthcheck.js ./healthcheck.js

# Switch to non-root user
USER clinicapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]