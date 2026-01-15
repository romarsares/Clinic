# Pediatric Clinic SaaS

Clinic SaaS is a comprehensive, multi-tenant software-as-a-service platform designed for small and medium-sized clinics (SMEs). It serves as the "operating system" for a clinic, replacing chaotic manual processes with structured workflows for appointment management, patient records, **clinical documentation (diagnoses, treatments), laboratory management,** billing, and reporting.

## 🏗️ Project Structure

```
clinic-saas/
├── docs/                          # Documentation
│   ├── clinic_saas_api_endpoints.md
│   ├── clinic_saas_blueprint_explained.md
│   ├── clinic_saas_compliance.md
│   ├── clinic_saas_db_schema.md
│   ├── clinic_saas_development_plan.md
│   ├── clinic_saas_mysql_ddl.md
│   ├── additional_diagrams_suggestions.md
│   ├── prd.md
│   ├── task.md
│   ├── risk.md
│   ├── decisions.md
│   ├── completion_summary.md
│   ├── pediatric_clinic_saas_workflow.md
│   └── developer-workflow-cheat-sheet.md
├── src/                           # Source code
│   └── server.js
├── config/                        # Configuration files
│   ├── .env.example
│   └── redis/
├── docker/                        # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── scripts/                       # Deployment scripts
│   ├── deploy-ubuntu.sh
│   ├── test-deployment.sh
│   └── DEPLOYMENT.md
├── tests/                         # Test files
│   └── healthcheck.js
├── package.json                   # Node.js dependencies
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0+

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd clinic-saas

# Install dependencies
npm install

# Copy environment configuration
cp config/.env.example .env

# Start development environment
docker-compose -f docker/docker-compose.yml up -d

# Start the application
npm run dev
```

### Production Deployment
```bash
# Run automated deployment
chmod +x scripts/deploy-ubuntu.sh
./scripts/deploy-ubuntu.sh

# Test deployment
./scripts/test-deployment.sh
```

## 📋 Key Features

- **Multi-Tenant Architecture**: Supports multiple clinics on shared infrastructure with isolated data
- **User & Role Management**: Hierarchical roles (Owner, Doctor, Staff, Lab Technician) with RBAC
- **Appointment Management**: Core functionality for scheduling and reducing no-shows
- **Patient Management**: Comprehensive patient records including demographics and medical history
- **Clinical Documentation**: Structured records for diagnoses, treatment plans, and visit notes
- **Laboratory Management**: End-to-end workflow for lab requests and results
- **Billing & Invoicing**: Tracks charges for consultations, procedures, and lab tests
- **Reporting & Analytics**: Dashboards for operational and clinical metrics
- **Audit Logs**: Enhanced tracking for all clinical data access

## 🛡️ Security & Compliance

- **PH Data Privacy Act Compliance**: Healthcare-grade security for PHI data
- **JWT Authentication**: Stateless token-based authentication
- **AES-256 Encryption**: For sensitive patient data
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Prevention of injection attacks
- **Audit Logging**: Complete activity tracking

## 📚 Documentation

All documentation is organized in the `docs/` directory:

- **[Product Requirements](docs/prd.md)** - Business requirements and features
- **[API Endpoints](docs/clinic_saas_api_endpoints.md)** - Complete API specification
- **[Database Schema](docs/clinic_saas_db_schema.md)** - Data model and relationships
- **[Development Plan](docs/clinic_saas_development_plan.md)** - Implementation roadmap
- **[Compliance Guide](docs/clinic_saas_compliance.md)** - Security and regulatory requirements
- **[Deployment Guide](scripts/DEPLOYMENT.md)** - Production deployment instructions

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Caching**: Redis
- **Deployment**: Automated scripts for Ubuntu servers

### Development Tools
- **Testing**: Jest, Supertest
- **Linting**: ESLint
- **Process Management**: PM2 (production)
- **Documentation**: Markdown

## 🔧 Configuration

### Environment Variables
Copy `config/.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PASSWORD=N1mbu$12354

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_char_encryption_key

# Email/SMS (optional)
SMTP_USER=your_email@gmail.com
SMS_API_KEY=your_sms_api_key
```

### Docker Services
- **clinic-api**: Main application (port 3000)
- **clinic-db**: MySQL database (port 3306)
- **clinic-redis**: Redis cache (port 6379)
- **clinic-nginx**: Reverse proxy (ports 80, 443)

## 📈 Development Phases

1. **Phase 0**: Validation & Setup ✅
2. **Phase 1**: Core Foundation (Authentication, Multi-tenancy)
3. **Phase 2**: Clinical Documentation
4. **Phase 3**: Laboratory Integration
5. **Phase 4**: Billing & Payments
6. **Phase 5**: UX Completion & Advanced Features

## 🤝 Contributing

1. Review `docs/task.md` for current phase tasks
2. Follow the development workflow in `docs/developer-workflow-cheat-sheet.md`
3. Ensure compliance with `docs/clinic_saas_compliance.md`
4. Test locally before committing

## 📞 Support

- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `docs/` directory first

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### Authentication & Security
- **JWT Authentication**: Stateless token-based auth with access and refresh tokens
- **Password Security**: bcrypt for hashing, with salt rounds
- **Rate Limiting**: Middleware (e.g., `express-rate-limit`) to prevent abuse
- **Input Validation**: Server-side validation with Joi to prevent injection attacks
- **HTTPS**: SSL/TLS certificates for secure data transmission

### Development & Testing
- **nodemon** - Development server with auto-restart
- **jest** - Unit and integration testing
- **supertest** - API endpoint testing
- **eslint** - Code linting and style enforcement

### Optional Integrations
- **Stripe** - Payment processing for subscriptions (if moving beyond manual billing)
- **Twilio** - SMS notifications for appointments
- **Google Calendar** - Calendar integration for appointments
- **Slack/Microsoft Teams** - Team communication integrations

## SMS Integration

SMS integration is a critical component for enhancing clinic operations by enabling automated notifications and improving patient engagement.

### Use Cases
- **Appointment Reminders**: Send SMS 24 hours before scheduled appointments
- **Confirmation Messages**: Notify patients when appointments are booked or rescheduled
- **No-Show Alerts**: Alert clinic staff when patients don't arrive
- **Billing Notifications**: Send payment reminders or receipts
- **Emergency Alerts**: Critical notifications for urgent situations

### Implementation
- **Provider**: Twilio (recommended) or similar SMS gateway
- **Cost**: Varies by provider and country (e.g., ~$0.0075 per SMS)
- **Integration**: REST API calls to SMS provider
- **Opt-in**: Patient consent required for marketing messages

### Benefits
- **Reduced No-Shows**: Reminder SMS can decrease no-show rates by 30-50%
- **Better Communication**: Instant notifications improve patient satisfaction
- **Operational Efficiency**: Automated messaging frees up staff time
- **Compliance**: Trackable delivery for regulatory requirements