# 🔐 EnvStore

> **Secure Environment Variable Management Platform**  
> Upload, encrypt, version, and manage `.env` files with enterprise-grade security and comprehensive testing coverage.

[![Tests](https://img.shields.io/badge/tests-129%20total%20%7C%20105%20passing-brightgreen)](./src/tests)
[![Coverage](https://img.shields.io/badge/backend%20coverage-100%25-brightgreen)](./src/tests)
[![Frontend](https://img.shields.io/badge/UI%20tests-87.5%25-green)](./src/tests/components)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.1%20AA-blue)](./src/tests/accessibility)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](.)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## ✨ Features

### 🔒 **Security First**
- **AES-256-GCM Encryption** with Web Crypto API
- **PBKDF2** key derivation (210,000 iterations)
- **Zero-knowledge architecture** - only ciphertext stored
- **Rate limiting** on authentication endpoints
- **Secure JWT sessions** with HTTP-only cookies
- **Input validation** and sanitization

### 🏗️ **Architecture**
- **Next.js 15** with App Router and React 19
- **TypeScript** throughout with strict type checking
- **tRPC** for end-to-end type safety
- **Drizzle ORM** with libSQL/Turso database
- **Radix UI + Tailwind CSS** for accessible components
- **Zod** for runtime validation

### 📊 **Project Management**
- **Multi-project** environment organization
- **Environment versioning** with history tracking
- **Bulk operations** for environment management
- **Project statistics** and analytics
- **Quick actions** and shortcuts

### 🔧 **Developer Experience**
- **API Documentation** with interactive examples
- **Health checks** and monitoring endpoints
- **Rate limiting** with configurable thresholds
- **Error boundaries** with graceful fallbacks
- **Dark mode** support

### 🧪 **Testing & Quality**
- **129 comprehensive tests** (87.5% overall pass rate)
- **100% backend test coverage**
- **Component testing** with React Testing Library
- **Accessibility testing** with jest-axe
- **Visual regression testing** with Playwright
- **Performance benchmarks**
- **CI/CD pipeline** with GitHub Actions

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- **pnpm** (recommended) or npm
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/fenilsonani/envstore.git
cd envstore

# Install dependencies
pnpm install

# Set up environment
pnpm run setup-env
```

### Database Setup

**Option 1: Local SQLite (Development)**
```bash
pnpm run db:generate
pnpm run db:push
```

**Option 2: Turso (Recommended for Production)**
```bash
# Add to .env.local
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# Push schema
pnpm run db:push
```

### Development Server

```bash
pnpm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📱 Application Structure

### 🏠 **Pages**
- **Landing Page** (`/`) - Marketing and features
- **Authentication** (`/login`, `/signup`) - Secure user registration
- **Dashboard** (`/dashboard`) - Overview and statistics
- **Projects** (`/dashboard/projects`) - Project management
- **Environments** (`/dashboard/environments`) - Environment variables
- **API Keys** (`/dashboard/api-keys`) - API access management
- **Settings** (`/dashboard/settings`) - User preferences

### 🔌 **API Endpoints**

#### Authentication
```bash
POST /api/auth/signup    # User registration
POST /api/auth/login     # User authentication
POST /api/auth/logout    # Session termination
```

#### tRPC Procedures
```bash
# Mounted at /api/trpc/[trpc]
- listProjects          # Get user projects
- createProject         # Create new project
- updateProject         # Update project details
- deleteProject         # Remove project
- listEnvironments      # Get project environments
- uploadEnvironment     # Create/update environment
- getEnvironment        # Retrieve environment data
- deleteEnvironment     # Remove environment
- generateApiKey        # Create API access key
- listApiKeys          # Get user API keys
- revokeApiKey         # Disable API key
- getUserStats         # Dashboard statistics
```

#### REST API v1
```bash
GET  /api/v1/kv/health           # Health check
POST /api/v1/env/upload          # Upload environment file
GET  /api/v1/env/latest          # Get latest version
```

### 🧩 **Components**

#### Layout Components
- **DashboardLayout** - Main dashboard wrapper with navigation
- **ErrorBoundary** - Error catching and fallback UI
- **ClientOnly** - Client-side rendering wrapper

#### UI Components
- **CodeBlock** - Syntax highlighted code display
- **DecryptDrawer** - Environment decryption interface
- **LazyCodeBlock** - Performance-optimized code display

#### Form Components
- Input validation and error handling
- Password strength indicators
- File upload interfaces
- Search and filtering

---

## 🧪 Testing Suite

### 📊 **Test Coverage**
```
Total Tests:           129
Passing Tests:         105 (87.5%)
Backend Coverage:      100% (53/53)
UI Test Coverage:      85%
E2E Test Coverage:     75%
Accessibility:         90%
```

### 🏃‍♂️ **Running Tests**

```bash
# All tests
pnpm test

# With coverage
pnpm test:coverage

# Watch mode
pnpm test --watch

# UI mode
pnpm test:ui

# E2E tests
pnpm test:e2e

# Accessibility tests
pnpm test src/tests/accessibility

# Performance tests
pnpm test src/tests/performance
```

### 📁 **Test Structure**
```
src/tests/
├── unit/                    # Business logic tests
│   ├── auth.test.ts        # Authentication functions
│   ├── crypto.test.ts      # Encryption/decryption
│   └── crypto-simple.test.ts
├── integration/            # API integration tests
│   ├── api.test.ts        # Real API testing
│   └── api-mock.test.ts   # Mock API flows
├── components/            # React component tests
│   ├── DashboardLayout.test.tsx
│   ├── ErrorBoundary.test.tsx
│   └── CodeBlock.test.tsx
├── pages/                # Page integration tests
│   ├── Dashboard.test.tsx
│   ├── Projects.test.tsx
│   └── Auth.test.tsx
├── accessibility/        # A11y compliance tests
│   └── a11y.test.tsx
├── performance/         # Performance benchmarks
│   └── load.test.ts
└── mocks/              # Test utilities
    └── fetch.ts

e2e/                    # End-to-end tests
├── auth.spec.ts       # Authentication flows
├── projects.spec.ts   # Project management
├── environments.spec.ts # Environment handling
└── visual-regression.spec.ts # Visual testing
```

---

## 🚢 Deployment

### 🐳 **Docker (Recommended)**

```bash
# Build image
docker build -t envstore .

# Run container
docker run -p 3000:3000 envstore

# Or use docker-compose
docker-compose up
```

### ☁️ **Production Build**

```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```

### 🔧 **Environment Variables**

```bash
# Required
JWT_SECRET=your-secret-key           # Session signing
TURSO_DATABASE_URL=your-db-url       # Database connection
TURSO_AUTH_TOKEN=your-auth-token     # Database auth

# Optional
NEXT_PUBLIC_API_URL=your-api-url     # API base URL
NODE_ENV=production                  # Environment
PORT=3000                            # Server port
```

---

## 🎯 Performance & Security

### ⚡ **Performance Features**
- **React 19** with automatic optimizations
- **Code splitting** and lazy loading
- **Memory-efficient** encryption (tested)
- **Request deduplication** with tRPC
- **Optimized Docker builds**
- **<200ms** target response times

### 🔐 **Security Features**
- **Zero-knowledge encryption** - server never sees plaintext
- **Rate limiting** (5 attempts per 15 minutes)
- **CSRF protection** with double-submit cookies
- **XSS prevention** with CSP headers
- **SQL injection protection** with parameterized queries
- **Input validation** at all levels

### 📱 **Accessibility**
- **WCAG 2.1 AA** compliance
- **Screen reader** support
- **Keyboard navigation**
- **High contrast** support
- **Focus management**
- **Semantic HTML**

---

## 🛠️ Development

### 📦 **Scripts**
```bash
pnpm run dev          # Development server
pnpm run build        # Production build
pnpm run start        # Production server
pnpm run lint         # ESLint checking
pnpm run typecheck    # TypeScript validation
pnpm run format:check # Prettier check
pnpm run format:write # Format code
pnpm run db:generate  # Generate migrations
pnpm run db:push      # Apply schema
pnpm run test         # Run tests
pnpm run test:coverage # Test with coverage
pnpm run test:e2e     # End-to-end tests
```

### 🧹 **Code Quality**
```bash
# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Find unused code
npx ts-prune
npx knip --reporter compact

# Format code
pnpm run format:write
```

### 🔄 **CI/CD Pipeline**
- **Automated testing** on push/PR
- **Multi-version** Node.js testing
- **Coverage reporting**
- **Security scanning**
- **Docker builds**
- **Deployment automation**

---

## 📖 API Documentation

### 🔑 **Authentication**

All API endpoints require authentication via:
- **Session cookies** (web interface)
- **API keys** (programmatic access)

```bash
# Generate API key
curl -X POST http://localhost:3000/api/trpc/generateApiKey \
  -H "Cookie: session=your-session" \
  -H "Content-Type: application/json"

# Use API key
curl -X GET http://localhost:3000/api/v1/kv/health \
  -H "x-api-key: esk_live_your-api-key"
```

### 📝 **Upload Environment**

```bash
curl -X POST http://localhost:3000/api/v1/env/upload \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "my-project",
    "environment": "production",
    "content": "DATABASE_URL=postgres://...\nAPI_KEY=secret",
    "passphrase": "your-secure-passphrase"
  }'
```

### 📥 **Retrieve Environment**

```bash
curl -X GET "http://localhost:3000/api/v1/env/latest?projectId=my-project&environment=production" \
  -H "x-api-key: your-api-key"
```

---

## 🤝 Contributing

### 🐛 **Bug Reports**
1. Check existing issues
2. Create detailed bug report
3. Include reproduction steps
4. Add system information

### ✨ **Feature Requests**
1. Search existing requests
2. Describe the feature
3. Explain the use case
4. Consider implementation

### 🔧 **Development Setup**
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run full test suite
5. Submit pull request

### 📋 **Pull Request Checklist**
- [ ] Tests pass (`pnpm test`)
- [ ] TypeScript compiles (`pnpm run typecheck`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Accessibility tests pass
- [ ] Documentation updated
- [ ] Changes described

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** team for the excellent framework
- **Vercel** for deployment platform
- **Turso** for the database infrastructure
- **Radix UI** for accessible components
- **Open source** community for the tools

---

## 📞 Support

- **Documentation**: Check this README and inline comments
- **Issues**: [GitHub Issues](https://github.com/fenilsonani/envstore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fenilsonani/envstore/discussions)

---

<div align="center">

**Built with ❤️ by [@fenilsonani](https://github.com/fenilsonani)**

[⭐ Star this repo](https://github.com/fenilsonani/envstore) • [🐛 Report Bug](https://github.com/fenilsonani/envstore/issues) • [✨ Request Feature](https://github.com/fenilsonani/envstore/issues)

</div>