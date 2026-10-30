# GROOMING-CHECKLIST.md — Comprehensive Grooming Questions

> All questions the agent must ask during grooming (Gate H1).
> 10 sections covering the full production-grade stack.
> Agent challenges answers per `GROOMING-PROTOCOL.md`.

---

## How to Use

1. Agent asks questions section by section
2. Agent captures answers
3. Agent challenges weak or risky answers
4. Human justifies or adjusts
5. Move to next section only when current is complete
6. All sections must be addressed before proceeding

---

## Section 1: BUSINESS

> Understanding the why, who, and what.

### Questions

```
1.1 WHO are the target users?
    - Primary persona (main user type)
    - Secondary personas (other user types)
    - Admin/operator personas (if any)

1.2 WHAT are the business goals?
    - Primary KPI (key success metric)
    - Secondary KPIs
    - How will success be measured?

1.3 WHAT is the MVP scope?
    - Must-have features (launch blockers)
    - Should-have features (important but not blocking)
    - Nice-to-have features (future phases)
    - Explicitly out of scope

1.4 WHAT is the timeline?
    - Target launch date
    - Hard deadline or flexible?
    - Milestones between now and launch

1.5 ARE there compliance/regulatory requirements?
    - GDPR (EU data protection)
    - PCI-DSS (payment card data)
    - HIPAA (health data)
    - SOC 2 (security controls)
    - Industry-specific regulations
    - Data residency requirements

1.6 WHO are the stakeholders?
    - Decision makers
    - Technical reviewers
    - Business reviewers
    - End users for UAT
```

### Challenge Points
- Vague personas → push for specifics
- No KPIs → how will you know if it's successful?
- Everything is "must-have" → that's not prioritization
- Aggressive timeline + large scope → contradiction

---

## Section 2: ARCHITECTURE

> System structure and boundaries.

### Questions

```
2.1 WHAT is the system topology?
    - Monolith (single deployable)
    - Modular monolith (logical modules, single deploy)
    - Microservices (multiple deployables)
    - Serverless (function-based)
    - Hybrid (combination)

2.2 WHAT is the repository structure?
    - Monorepo (all code in one repo)
    - Polyrepo (separate repos per service)
    - Hybrid (shared libs in one, services in many)

2.3 HOW is frontend/backend split?
    - Monolithic (SSR, templates)
    - SPA + API (separate frontend and backend)
    - Mobile + API (native apps)
    - Multiple clients (web + mobile + API)

2.4 WHAT database strategy?
    - Single relational (PostgreSQL, MySQL)
    - Single document (MongoDB, DynamoDB)
    - Multi-database (OLTP + OLAP)
    - Database per service
    - Specific database choices and why

2.5 WHAT caching strategy?
    - No caching (simplicity)
    - Application-level (in-memory)
    - Distributed cache (Redis, Memcached)
    - CDN caching (static assets)
    - Cache invalidation strategy

2.6 DO you need a message queue / event bus?
    - No async processing needed
    - Simple queue (SQS, RabbitMQ)
    - Event streaming (Kafka, Kinesis)
    - Pub/sub (SNS, Google Pub/Sub)

2.7 WHAT third-party integrations?
    - Payment providers
    - Auth providers
    - Email/SMS services
    - Analytics services
    - Other external APIs
```

### Challenge Points
- Microservices for small team → over-engineering
- No caching strategy for high-traffic app → under-engineering
- Multiple databases without clear justification → complexity
- Missing integration list → incomplete picture

---

## Section 3: DESIGN PATTERNS

> How the system handles common concerns.

### Questions

```
3.1 WHAT state management pattern?
    - Server-side sessions
    - Client-side state (Redux, Zustand, Jotai)
    - Server state (React Query, SWR)
    - URL state
    - Combination

3.2 WHAT API pattern?
    - REST
    - GraphQL
    - gRPC
    - WebSocket (real-time)
    - Combination

3.3 WHAT authentication pattern?
    - Session-based
    - JWT (stateless tokens)
    - OAuth 2.0 / OIDC
    - API keys (service-to-service)
    - Multi-factor authentication

3.4 WHAT authorization pattern?
    - Role-based (RBAC)
    - Attribute-based (ABAC)
    - Permission-based
    - Resource-based

3.5 WHAT error handling pattern?
    - Error codes (enumerated)
    - Error messages (human-readable)
    - Error taxonomy (categories)
    - Retry strategies
    - Circuit breaker

3.6 WHAT logging/observability pattern?
    - Structured logging (JSON)
    - Correlation IDs (request tracing)
    - Log levels (debug, info, warn, error)
    - Sensitive data redaction
```

### Challenge Points
- No state management strategy → will become chaotic
- REST + GraphQL without clear use cases → unnecessary complexity
- JWT without refresh strategy → security risk
- No error taxonomy → inconsistent error handling

---

## Section 4: TECH STACK

> Specific technology choices. Challenge trendy picks and surface hidden costs.

### Questions

```
4.1 WHAT language(s)?
    - Backend language(s)
    - Frontend language(s)
    - Why these choices?

4.2 WHAT framework(s)?
    - Backend framework
    - Frontend framework
    - Why these choices?

4.3 TEAM EXPERTISE — does the team have production experience?
    - Who on the team has shipped production code with this stack?
    - If no one, what's the learning ramp-up plan?
    - Is this a learning project disguised as a product?
    - Who owns the risk if the team can't deliver?

4.4 MAINTENANCE & LONGEVITY
    - Is this technology actively maintained?
    - When was the last major release? Last security patch?
    - What's the upgrade/migration path when major versions drop?
    - Who owns the risk if the project is abandoned?

4.5 LICENSING & COMMERCIAL USE
    - What license (MIT, Apache, GPL, proprietary)?
    - Any restrictions on commercial use or distribution?
    - Any dependencies with viral licenses (GPL)?
    - Any paid features that will be needed at scale?

4.6 WHAT UI library / design system?
    - Component library (MUI, Chakra, Tailwind)
    - Design tokens (colors, typography, spacing)
    - Existing design system or new?

4.7 WHAT testing frameworks?
    - Unit testing
    - Integration testing
    - E2E testing
    - Contract testing

4.8 WHAT build tools?
    - Package manager (npm, yarn, pnpm)
    - Bundler (Vite, Webpack, esbuild)
    - Task runner
    - Monorepo tools (if applicable)
```

### Challenge Points
- Framework choice without team expertise → training cost, delivery risk
- "We chose X because someone read about it" → probe for production experience
- Multiple languages without justification → hiring complexity
- Technology chosen for hype, not fit → ask "why this over alternatives?"
- No testing framework decisions → will be ad-hoc
- Exotic build tools → maintenance burden
- Unmaintained dependencies → future security/compatibility risk
- GPL dependencies in commercial product → licensing landmine
- Framework with frequent breaking changes → upgrade tax

### Red Flag Responses
- "It's popular right now" → Who on team has production experience?
- "We'll learn as we go" → What's the budget for learning? Who owns delivery risk?
- "Everyone uses it" → Does it fit THIS problem? What are the alternatives?
- "The docs are great" → Docs ≠ production experience. Who's done this before?
- "It's the future" → What happens if it isn't? What's the exit strategy?

---

## Section 5: INFRASTRUCTURE

> Where and how the system runs.

### Questions

```
5.1 WHAT cloud provider?
    - AWS
    - GCP
    - Azure
    - Multi-cloud
    - On-premise
    - Hybrid

5.2 WHAT compute strategy?
    - Virtual machines (EC2, Compute Engine)
    - Containers (ECS, EKS, Cloud Run)
    - Serverless (Lambda, Cloud Functions)
    - PaaS (Heroku, Railway, Render)

5.3 WHAT container strategy?
    - No containers
    - Docker only (no orchestration)
    - Kubernetes
    - Managed container service

5.4 WHAT CDN / edge strategy?
    - No CDN needed
    - CloudFront / Cloudflare / Fastly
    - Edge functions
    - Static hosting

5.5 WHAT DNS / domain strategy?
    - Domain name(s)
    - DNS provider
    - Subdomain strategy
```

### Challenge Points
- K8s for small team → operational overhead
- No CDN for global users → latency issues
- Multi-cloud without clear benefit → complexity
- No domain strategy → launch blocker

---

## Section 6: CI/CD & DELIVERY

> How code gets to production.

### Questions

```
6.1 WHAT source control?
    - GitHub
    - GitLab
    - Bitbucket
    - Azure DevOps

6.2 WHAT branching strategy?
    - GitFlow (feature/develop/release/main)
    - Trunk-based (short-lived branches)
    - GitHub Flow (feature branches to main)
    - Custom

6.3 WHAT CI pipeline?
    - GitHub Actions
    - GitLab CI
    - Jenkins
    - CircleCI
    - Other

6.4 WHAT CD pipeline?
    - Same as CI
    - ArgoCD / Flux (GitOps)
    - Spinnaker
    - Manual deployment

6.5 WHAT environments?
    - Development
    - Staging
    - Production
    - Preview environments (per PR)

6.6 DO you use feature flags?
    - No
    - Yes — which provider?

6.7 WHAT rollback strategy?
    - Redeploy previous version
    - Blue-green deployment
    - Canary deployment
    - Feature flag disable
```

### Challenge Points
- No staging environment → testing in production
- Manual deployment to production → human error risk
- No rollback strategy → recovery time risk
- Complex branching for small team → overhead

---

## Section 7: SECURITY

> Protecting the system and data.

### Questions

```
7.1 WHAT auth provider?
    - Custom auth (build your own)
    - Auth0 / Okta
    - AWS Cognito
    - Firebase Auth
    - Supabase Auth

7.2 HOW are secrets managed?
    - Environment variables
    - AWS Secrets Manager / Parameter Store
    - HashiCorp Vault
    - Doppler / 1Password
    - Kubernetes secrets

7.3 WHAT static analysis (SAST)?
    - SonarQube / SonarCloud
    - Snyk
    - CodeQL
    - Semgrep
    - None

7.4 WHAT dependency scanning?
    - Dependabot
    - Snyk
    - npm audit / yarn audit
    - None

7.5 WHAT dynamic analysis (DAST)?
    - OWASP ZAP
    - Burp Suite
    - None
    - Penetration testing plan

7.6 WHAT network security?
    - VPC / private networking
    - WAF (Web Application Firewall)
    - DDoS protection
    - API rate limiting
```

### Challenge Points
- Custom auth for MVP → security risk, reinventing wheel
- Secrets in environment variables only → rotation difficulty
- No SAST/DAST → vulnerabilities will slip through
- No rate limiting → abuse risk

---

## Section 8: OBSERVABILITY

> Seeing what the system is doing.

### Questions

```
8.1 WHAT logging solution?
    - CloudWatch / Cloud Logging
    - ELK Stack (Elasticsearch, Logstash, Kibana)
    - Datadog
    - Splunk
    - Loki + Grafana

8.2 WHAT metrics solution?
    - CloudWatch Metrics
    - Prometheus + Grafana
    - Datadog
    - New Relic

8.3 WHAT tracing solution?
    - AWS X-Ray
    - Jaeger
    - Datadog APM
    - Honeycomb
    - None

8.4 WHAT alerting strategy?
    - CloudWatch Alarms
    - PagerDuty
    - Opsgenie
    - Slack alerts
    - Alert thresholds and escalation

8.5 WHAT dashboards?
    - Grafana
    - CloudWatch Dashboards
    - Datadog Dashboards
    - Custom
```

### Challenge Points
- No logging strategy → debugging in the dark
- No tracing for distributed system → impossible to debug
- No alerting → find out from users
- Too many tools → context switching, cost

---

## Section 9: QUALITY

> Ensuring the system works correctly.

### Questions

```
9.1 WHAT code coverage target?
    - Percentage target (workflow default: ≥ 80%)
    - Coverage for what (lines, branches, functions)
    - Critical paths with higher target

9.1b WHAT is enforced at COMMIT time (local guard)?
    - Husky pre-commit guard: lint + type-check + related tests + coverage gate
    - Coverage threshold enforced on changed code (default ≥ 80%)
    - Is bypassing (--no-verify) ever allowed? (workflow default: no)

9.2 WHAT static analysis rules?
    - Linting rules (ESLint, Prettier)
    - Type checking (TypeScript strict mode)
    - SonarQube quality gates

9.3 WHAT E2E test strategy?
    - E2E framework (Playwright, Cypress, Maestro)
    - Critical user journeys covered
    - Frequency (every PR, nightly, release)

9.4 WHAT performance testing?
    - Load testing tool (k6, Locust, Artillery)
    - Performance budgets
    - Frequency

9.5 WHAT accessibility testing?
    - Automated (axe, Lighthouse)
    - Manual
    - WCAG compliance level
```

### Challenge Points
- 100% coverage target + fast MVP → contradiction
- No E2E for user-facing app → regression risk
- No performance testing for high-traffic app → scaling surprises
- No accessibility plan → legal and ethical risk

---

## Section 10: OPERATIONS

> Running and maintaining the system.

### Questions

```
10.1 WHAT SLA targets?
    - Uptime target (99.9%, 99.99%)
    - Response time targets
    - Error rate targets

10.2 WHAT disaster recovery plan?
    - RTO (Recovery Time Objective)
    - RPO (Recovery Point Objective)
    - DR region/strategy

10.3 WHAT backup strategy?
    - Database backup frequency
    - Retention period
    - Backup testing frequency

10.4 WHAT incident response?
    - On-call rotation
    - Escalation path
    - Runbooks / playbooks
    - Post-mortem process
```

### Challenge Points
- 99.99% uptime without redundancy → impossible
- No backup strategy for user data → data loss risk
- No incident response plan → chaos during outages
- No runbooks → tribal knowledge dependency

---

## Completion Checklist

Before proceeding to Phase 2 (Documentation Generation):

```
[ ] Section 1: BUSINESS — all questions answered
[ ] Section 2: ARCHITECTURE — all questions answered
[ ] Section 3: DESIGN PATTERNS — all questions answered
[ ] Section 4: TECH STACK — all questions answered
[ ] Section 5: INFRASTRUCTURE — all questions answered
[ ] Section 6: CI/CD & DELIVERY — all questions answered
[ ] Section 7: SECURITY — all questions answered
[ ] Section 8: OBSERVABILITY — all questions answered
[ ] Section 9: QUALITY — all questions answered
[ ] Section 10: OPERATIONS — all questions answered
[ ] All contradictions resolved
[ ] All critical risks acknowledged
[ ] Human confirmed: ready to proceed
```
