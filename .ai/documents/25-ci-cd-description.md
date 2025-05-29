# CI/CD Process Description - 10xTranslationsFactory

*Last Updated: January 2025*

## Overview

Ten dokument opisuje kompletny proces Continuous Integration/Continuous Deployment (CI/CD) dla projektu 10xTranslationsFactory - od momentu wykonania `git push` aż do wdrożenia na platform Netlify.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │───▶│   GitHub Repo    │───▶│  GitHub Actions │───▶│     Netlify     │
│   Local Env     │    │   (git push)     │    │    (CI/CD)      │    │   (Production)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │                        │
                                ▼                        ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                       │   Pull Request   │    │  Testing &      │    │   Live Site     │
                       │   (Optional)     │    │  Quality Gates  │    │   Monitoring    │
                       └──────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Core Technologies
- **Framework:** Astro 5 with React 19
- **Language:** TypeScript 5  
- **Styling:** Tailwind CSS 4 + Shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **AI Integration:** OpenAI API

### CI/CD Tools
- **Version Control:** GitHub
- **CI/CD Pipeline:** GitHub Actions
- **Deployment Platform:** Netlify
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Code Quality:** ESLint + Prettier

## Detailed CI/CD Flow

### 1. Developer Workflow (Local Development)

```bash
# 1. Developer makes changes locally
git checkout -b feature/new-feature
# ... code changes ...

# 2. Local testing and validation
npm run lint          # ESLint checks
npm run format        # Prettier formatting
npm run test:unit     # Unit tests with Vitest
npm run test:e2e      # E2E tests with Playwright
npm run build         # Production build test

# 3. Commit with Husky hooks
git add .
git commit -m "feat: add new feature"
# → Husky runs lint-staged automatically
#   - ESLint fix on *.{ts,tsx,astro}
#   - Prettier format on *.{json,css,md}

# 4. Push to remote
git push origin feature/new-feature
```

### 2. Pull Request Workflow

When a pull request is created, GitHub Actions triggers the **Pull Request Workflow** (`.github/workflows/pull-request.yml`):

#### 2.1 Quality Gates Pipeline

```yaml
# Parallel execution for efficiency
lint → [unit-test, e2e-test] → status-comment
```

**Step 1: Lint Check**
- **Runtime:** Ubuntu Latest
- **Node Version:** Defined in `.nvmrc` (Node 20)
- **Commands:**
  ```bash
  npm ci                    # Clean dependency install
  npm run lint             # ESLint code quality check
  ```
- **Purpose:** Ensure code quality standards

**Step 2: Unit Tests** (runs in parallel with E2E)
- **Runtime:** Ubuntu Latest  
- **Environment:** `NODE_ENV=test`
- **Commands:**
  ```bash
  npm ci                    # Clean dependency install
  npm run test:coverage    # Vitest with coverage report
  ```
- **Artifacts:** Coverage reports stored for 7 days
- **Purpose:** Validate individual component functionality

**Step 3: E2E Tests** (runs in parallel with Unit)
- **Runtime:** Ubuntu Latest
- **Environment:** Integration environment with secrets
- **Environment Variables:**
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY` 
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_API_ENDPOINT`
- **Commands:**
  ```bash
  npm ci                           # Dependencies
  npx playwright install chromium  # Browser setup
  npm run build                    # Production build
  npm run test:e2e                # Full E2E testing
  ```
- **Artifacts:** Test reports and videos stored for 7 days
- **Purpose:** Validate end-user workflows

**Step 4: Status Comments**
- **Success:** Automated ✅ comment on PR with results summary
- **Failure:** Automated ❌ comment with detailed failure analysis
- **Purpose:** Immediate feedback to developers

### 3. Main Branch Push Workflow

When code is pushed to `master` branch, GitHub Actions triggers the **Push Workflow** (`.github/workflows/push.yml`):

#### 3.1 Extended Quality Pipeline

```yaml
lint → [test-unit, test-e2e] → build-and-deploy
```

**Step 1: Lint Check**
- Same as PR workflow but for production branch
- **Commands:**
  ```bash
  npm ci
  npm run lint
  npm run format -- --check    # Verify formatting
  ```

**Step 2: Production Unit Tests**
- **Environment:** `integration` with full secrets
- **Environment Variables:**
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
- **Commands:**
  ```bash
  npm ci
  npm run test:coverage
  ```
- **Coverage Upload:** Codecov integration with unit-test flags
- **Purpose:** Final validation before deployment

**Step 3: Production E2E Tests**
- **Environment:** `integration` with complete secret set
- **Extended Environment Variables:**
  - All Supabase credentials
  - Database connection strings
  - OpenRouter API credentials
- **Commands:**
  ```bash
  npm ci
  npx playwright install --with-deps    # Full browser setup
  npm run build                         # Production build
  npm run test:e2e                     # Complete E2E suite
  ```
- **Artifacts:** Test results and coverage for Codecov
- **Purpose:** Final user workflow validation

**Step 4: Build and Deploy**
- **Condition:** Only runs if both test jobs succeed
- **Environment:** `production` with production secrets
- **Commands:**
  ```bash
  npm ci                    # Production dependencies
  npm run build            # Astro production build
  ```
- **Artifacts:** Build artifacts (`dist/`) stored for 7 days
- **Purpose:** Prepare deployment artifacts

### 4. Netlify Deployment Process

#### 4.1 Netlify Configuration

**Build Settings** (from `netlify.toml`):
```toml
[build]
  command = "npm run build"    # Astro build command
  publish = "dist/"           # Output directory

[build.environment]
  NODE_VERSION = "20"         # Node.js version

[[redirects]]
  from = "/*"                 # SPA routing support
  to = "/index.html"
  status = 200
  force = false
```

#### 4.2 Automatic Deployment Trigger

Netlify monitors the GitHub repository and automatically triggers deployment when:
- New commits are pushed to `master` branch
- GitHub Actions pipeline completes successfully
- Build artifacts are ready

#### 4.3 Netlify Build Process

```bash
# 1. Environment Setup
NODE_VERSION=20              # From netlify.toml
# Environment variables from Netlify dashboard:
# - PUBLIC_SUPABASE_URL
# - PUBLIC_SUPABASE_ANON_KEY

# 2. Dependency Installation  
npm ci                       # Clean install from package-lock.json

# 3. Production Build
npm run build               # Astro build with Netlify adapter
# → Generates static files in dist/
# → Creates Netlify Functions for API routes
# → Optimizes assets and bundles

# 4. Deployment
# → Static files deployed to Netlify CDN
# → API routes deployed as Netlify Functions
# → DNS and SSL automatically configured
```

#### 4.4 Netlify Features Utilized

**Server-Side Rendering (SSR):**
- Astro pages with `@astrojs/netlify` adapter
- API routes converted to Netlify Functions
- Middleware for authentication and routing

**Edge Functions:**
- API endpoints: `/api/auth/*`, `/api/languages`, `/api/exercises`
- Server-side authentication with Supabase
- Dynamic content generation

**Redirects and Routing:**
- SPA routing for client-side navigation
- API route proxying to functions
- Custom 404/error pages

### 5. Environment Management

#### 5.1 Environment Separation

**Development (`localhost`):**
- Local Supabase instance or cloud development project
- Development API keys
- Hot reload and debugging tools

**Integration (GitHub Actions):**
- Dedicated test Supabase project
- Test API credentials
- Automated testing environment

**Production (Netlify):**
- Production Supabase project
- Production API keys
- Performance optimized build

#### 5.2 Secret Management

**GitHub Secrets:**
```
PUBLIC_SUPABASE_URL          # Supabase project URL
PUBLIC_SUPABASE_ANON_KEY     # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY    # Admin access for testing
DATABASE_URL                 # Direct database connection
POSTGRES_USER                # Database credentials
POSTGRES_PASSWORD            # Database credentials  
POSTGRES_DB                  # Database name
OPENROUTER_API_KEY          # AI service credentials
OPENROUTER_API_ENDPOINT     # AI service endpoint
```

**Netlify Environment Variables:**
```
PUBLIC_SUPABASE_URL          # Production Supabase URL
PUBLIC_SUPABASE_ANON_KEY     # Production anonymous key
NODE_VERSION                 # Node.js version (from netlify.toml)
```

### 6. Quality Assurance

#### 6.1 Code Quality Gates

**Pre-commit (Husky + lint-staged):**
- ESLint fixes on TypeScript/Astro files
- Prettier formatting on config files
- Prevents commits with quality issues

**Pull Request Gates:**
- Linting must pass
- Unit tests must pass  
- E2E tests must pass
- Code coverage reports generated

**Deployment Gates:**
- All PR checks must pass
- Production build must succeed
- Test coverage uploaded to Codecov

#### 6.2 Testing Strategy

**Unit Testing (Vitest):**
- Component testing with React Testing Library
- Utility function testing
- API endpoint testing
- Coverage threshold enforcement

**E2E Testing (Playwright):**
- User authentication flows
- Content generation workflows  
- Question answering systems
- Cross-browser compatibility

#### 6.3 Performance Monitoring

**Build Performance:**
- Build time tracking in GitHub Actions
- Bundle size analysis
- Dependency audit

**Runtime Performance:**
- Netlify analytics dashboard
- Core Web Vitals monitoring
- Function execution times

### 7. Rollback and Recovery

#### 7.1 Automated Rollback Triggers

**Failed Deployment:**
- Netlify automatically retains previous successful deployment
- One-click rollback from Netlify dashboard
- GitHub Actions failure prevents bad deployments

**Runtime Issues:**
- Netlify monitoring detects availability issues
- Manual rollback to previous version available
- Database migrations can be reverted via Supabase

#### 7.2 Recovery Procedures

**Database Issues:**
- Supabase automatic backups (point-in-time recovery)
- Migration rollback scripts
- Data export/import procedures

**Application Issues:**
- Git revert to last known good commit
- Re-trigger deployment pipeline
- Hot-fix branch for critical issues

### 8. Monitoring and Observability

#### 8.1 Build Monitoring

**GitHub Actions:**
- Build status badges in README
- Email notifications on failures
- Slack integration (configurable)

**Netlify:**
- Deploy notifications
- Build performance metrics
- Function execution logs

#### 8.2 Application Monitoring

**Netlify Analytics:**
- Traffic patterns and user behavior
- Performance metrics
- Error rate monitoring

**Supabase Dashboard:**
- Database performance
- Authentication metrics  
- API usage statistics

**Third-party Integrations:**
- Codecov for test coverage
- OpenAI usage monitoring
- Custom logging solutions

### 9. Security Considerations

#### 9.1 Secret Security

**GitHub Secrets:**
- Encrypted at rest
- Limited scope access
- Regular rotation recommended

**Netlify Environment Variables:**
- Secure transmission
- Build-time injection only
- Production/preview separation

#### 9.2 Access Control

**GitHub Repository:**
- Branch protection rules on `master`
- Required PR reviews
- Status checks must pass

**Netlify Dashboard:**
- Team-based access control
- Deploy hook security
- Build log privacy

### 10. Optimization and Best Practices

#### 10.1 Build Optimization

**Dependency Management:**
- `npm ci` for reproducible builds
- Package-lock.json version control
- Optional dependencies for platform-specific packages

**Caching Strategy:**
- Node.js modules cached in GitHub Actions
- Netlify edge caching for static assets
- Supabase connection pooling

#### 10.2 Development Best Practices

**Branching Strategy:**
- Feature branches for development
- Pull requests for code review
- Protected master branch

**Commit Practices:**
- Conventional commit messages
- Atomic commits with single responsibility
- Husky hooks for consistency

### 11. Future Improvements

#### 11.1 Short-term Enhancements

- **Enhanced Monitoring:** Application Performance Monitoring (APM) integration
- **Security Scanning:** SAST/DAST tools in pipeline
- **Automated Testing:** Visual regression testing with Percy/Chromatic

#### 11.2 Long-term Roadmap

- **Multi-environment:** Staging environment addition
- **Blue-Green Deployment:** Zero-downtime deployment strategy
- **Infrastructure as Code:** Terraform for environment management

## Conclusion

The CI/CD pipeline for 10xTranslationsFactory provides a robust, automated path from development to production with multiple quality gates, comprehensive testing, and reliable deployment mechanisms. The combination of GitHub Actions and Netlify creates a seamless developer experience while maintaining high standards for code quality and application reliability.

Key strengths of this pipeline:
- ✅ **Automated Quality Assurance:** Multi-layered testing and validation
- ✅ **Fast Feedback:** Parallel execution and quick status updates  
- ✅ **Reliable Deployment:** Proven Netlify platform with automatic rollback
- ✅ **Security:** Comprehensive secret management and access control
- ✅ **Scalability:** Architecture supports growth and additional environments

The pipeline successfully supports a production-ready language learning platform with the flexibility to evolve as requirements grow. 