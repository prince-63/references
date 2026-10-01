# Architecture Overview — core-service

> **Last updated:** 30 March 2026  
> **Branch:** feature/5-0-8  
> **Author:** Architecture review

---

## 1. What Is core-service?

core-service is the **primary backend microservice** of the **DentalStack** platform — a dental practice management SaaS. It manages the full lifecycle of orthodontic patient care:

- Patient onboarding, profiles, and invitations
- Aligner & braces treatment journeys
- Treatment planning and production order management
- File/document storage (S3 + Google Drive)
- Real-time chat (WebSocket/STOMP)
- Billing, subscriptions (Chargebee), and payments
- Workflow engine (kanban, task tracker)
- Rewards & gamification
- RBAC (role-based access control)
- AI-powered treatment insights (TensorZero / Gemini RAG)

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Language** | Java | 19 |
| **Framework** | Spring Boot | 3.0.1 |
| **Cloud** | Spring Cloud | 2022.0.0 |
| **Database** | PostgreSQL | (managed) |
| **ORM** | Hibernate / JPA | 6.0 (via Spring Boot 3) |
| **Caching** | Redis (Lettuce client) | — |
| **Real-time** | WebSocket (STOMP over SockJS) | — |
| **Security** | Spring Security + custom JWT (jjwt 0.12.3) | — |
| **API Docs** | SpringDoc OpenAPI (Swagger) | 2.2.0 |
| **File Storage** | AWS S3 + Google Drive API v3 | — |
| **Billing** | Chargebee Java SDK | — |
| **Scheduling** | Quartz (JDBC job store) | — |
| **Monitoring** | New Relic + Spring Actuator | — |
| **AI/LLM** | TensorZero gateway + Google Gemini embeddings | — |
| **Build** | Gradle (parallel, caching, daemon) | — |
| **Code Quality** | Spotless (Palantir Java format) | — |
| **Container** | Docker (multi-stage) | openjdk-19 |
| **CI/CD** | Jenkins → GKE (Kubernetes) | arm64 |

**Key Libraries:** Lombok, ModelMapper, OpenCSV, BouncyCastle, Hypersistence Utils (JSONB), Feign, Jackson, Hibernate Validator, Hibernate Envers (auditing).

---

## 3. Codebase Statistics

| Metric | Count |
|--------|-------|
| Java source files | ~2,285 |
| Feature modules | 58 |
| REST controllers | 118 (108 with active endpoints) |
| Active REST endpoints | ~470+ |
| Entity classes | 80+ |
| Repository interfaces | 141 |
| Service interfaces | ~100+ |
| Test files | **2** ⚠️ |
| Enums | 145 |
| JPA Projections | 59 |

---

## 4. Package Structure

```
com.dentalstack.patient/
├── PatientServiceApplication.java          — @SpringBootApplication entry point
│
├── application/                            — Cross-cutting concerns
│   ├── aspects/                            — AOP logging (local profile only)
│   ├── config/                             — SecurityConfig, Redis, Async, Feign,
│   │                                         OpenAPI, WebMvc, MessageSource, etc.
│   ├── exception/                          — Global @ControllerAdvice exception handler
│   ├── interceptor/                        — DoctorAuth, ApiUsage interceptors
│   └── security/                           — Security annotations & utilities
│
├── global/                                 — Shared kernel
│   ├── constant/                           — GlobalConstant
│   ├── dto/                                — ErrorInfo, UserId, pagination, response builders
│   ├── entity/                             — BaseEntity (Long ID), NewBaseEntity (UUID),
│   │                                         Address, DraftFile
│   ├── enums/                              — CountryCode, ProductTypeName, Language
│   ├── exception/                          — BusinessException, BadRequestException, etc.
│   ├── utils/                              — CountryCodeMapper, IDGenerator
│   └── validators/                         — TimeZone validator
│
└── feature/                                — 58 domain feature modules
    ├── aligner/                            — Core aligner journey (LARGEST module)
    ├── api_registry/                       — API usage tracking
    ├── app_dentals/                        — Mobile app version management
    ├── appointment/                        — Scheduling & reminders
    ├── auth/                               — Auth service Feign client
    ├── billing/                            — Doctor billing
    ├── blog/                               — Blog management
    ├── braces/                             — Braces journey (alt. to aligner)
    ├── bracket/                            — Bracket types for braces
    ├── bulkupload/                         — CSV bulk patient import
    ├── cache/                              — Cache management controller
    ├── calendar/                           — Calendar views (v1-v3)
    ├── caseinfo/                           — Case information & anchor types
    ├── caserecord/                         — Case record management
    ├── chat/                               — Real-time chat (WebSocket, STOMP, Redis relay)
    ├── consent_template/                   — Consent forms & records
    ├── dailywins/                          — Patient daily tasks
    ├── dashboardlabel/                     — Custom dashboard labels
    ├── doctor/                             — Doctor profiles, dashboards (v1-v4)
    ├── doctorinvitation/                   — Doctor-to-doctor invitations
    ├── faq/                                — FAQ management (commented out)
    ├── feedback/                           — User feedback (commented out)
    ├── flag/                               — Feature flags
    ├── gettingstarted/                     — Onboarding wizard
    ├── invitation/                         — Patient invitation system
    ├── jobs/                               — Background jobs
    ├── location/                           — Country/state/city lookup (cached)
    ├── material/                           — Orthodontic materials catalog
    ├── mcp/                                — MCP API for AI integration
    ├── migration/                          — Data migration tools
    ├── notification/                       — WhatsApp, Slack, ChatServiceClient
    ├── order/                              — Order, manufacturing, shipping
    ├── patient/                            — Core patient entity & profiles
    ├── patient_onboarding/                 — Onboarding step tracking
    ├── payment/                            — Payment tracking & reminders
    ├── practice/                           — Practice management
    ├── prescription/                       — Prescriptions
    ├── production/                         — Aligner production (v2)
    ├── producttype/                        — Product type management
    ├── rbac/                               — Role-based access control
    ├── reminder/                           — General reminders
    ├── rewards/                            — Coins, wallet, tasks, promotions
    ├── sampledata/                         — Sample data & dashboard (v5)
    ├── search/                             — Global search (v1-v2)
    ├── smartbox/                           — Smart box feature
    ├── storage/                            — File system (S3, GDrive, gallery, migration)
    ├── storage_stats/                      — Storage usage statistics
    ├── subcription/                        — Subscription & Chargebee
    ├── timeline/                           — Patient timeline (40+ event types)
    ├── tracking/                           — Lead tracking
    ├── treatment/                          — Treatment plans & summaries
    ├── treatment_insights/                 — AI-powered treatment insights
    ├── treatmenttracking/                  — Treatment tracking with chat
    ├── user/                               — User entity, profiles, roles
    ├── vsp/                                — Virtual Service Provider module
    └── workflow/                           — Workflow engine (kanban, tasks, products)
```

Each feature module typically follows this internal structure:
```
feature/<name>/
├── controller/       — REST endpoints
├── dto/              — Request/response DTOs
├── entity/           — JPA entities
├── enums/            — Domain enums
├── exception/        — Feature-specific exceptions
├── projection/       — JPA projections for optimized queries
├── repository/       — Spring Data JPA repositories
├── service/          — Service interface + Impl
└── util/             — Feature-specific utilities
```

---

## 5. Inter-Service Architecture

```
                          ┌─────────────────────┐
                          │    Frontend Apps     │
                          │  (Web, Mobile, VSP)  │
                          └──────────┬──────────┘
                                     │ HTTPS / WSS
                          ┌──────────▼──────────┐
                          │   core-service:8900  │
                          │   (this service)     │
                          └──┬───┬───┬───┬───┬──┘
                             │   │   │   │   │
              ┌──────────────┘   │   │   │   └──────────────┐
              ▼                  ▼   │   ▼                  ▼
   ┌──────────────────┐  ┌─────────┐│┌──────────┐  ┌──────────────┐
   │  auth-service    │  │ doctor- │││ chat /    │  │ scheduler-   │
   │  (Feign)         │  │ service ││ notif-    │  │ service      │
   │  - org validate  │  │ (Feign) ││ service   │  │ (same repo)  │
   │  - user CRUD     │  │ - docs  ││ (Feign)   │  └──────────────┘
   │  - deactivate    │  │ - orgs  ││ - email   │
   └──────────────────┘  │ - pracs ││ - SMS     │
                         └─────────┘│ - WhatsApp│
                                    │ - push    │
                                    │ - chat    │
                                    └──────────┘
              │           │         │          │
   ┌──────────▼──┐ ┌──────▼────┐ ┌─▼────────┐ │
   │ PostgreSQL  │ │   Redis   │ │  AWS S3   │ │
   │ (JPA+Quartz │ │ (cache +  │ │ (files)   │ │
   │  +Envers)   │ │  WS relay)│ └──────────┘ │
   └─────────────┘ └───────────┘               │
                                    ┌──────────▼──┐
                                    │ Google Drive │
                                    │ (OAuth2,     │
                                    │  migration)  │
                                    └─────────────┘
        ┌──────────┐  ┌──────────────┐  ┌──────────────┐
        │ Chargebee│  │ TensorZero   │  │ Gemini       │
        │ (billing)│  │ (LLM gateway)│  │ (embeddings) │
        └──────────┘  └──────────────┘  └──────────────┘
```

### Feign Client Summary

| Client | Target Service | Methods | Purpose |
|--------|---------------|---------|---------|
| `ChatServiceClient` | notification-service | 50+ | Email, SMS, WhatsApp, push, chat ops |
| `DoctorServiceClient` | doctor-service | 16 | Doctor profiles, practices, organizations |
| `AuthServiceClient` | auth-service | 5 | Org validation, user management |

---

## 6. Security Architecture

### Filter Chain (order of execution)

```
1. ContentCachingFilter     (order: -200) — wraps request for body re-reading
2. OrganizationAuthFilter   (before UsernamePasswordAuth) — X-Organization-* headers
3. JWTAuthenticationFilter  (after OrgAuth) — Authorization: Bearer <jwt>
4. Spring Security Filters  (built-in)
5. DoctorAuthorizationInterceptor (MVC) — validates doctor identity
6. ApiUsageInterceptor      (MVC) — tracks API hit counts
```

### Profiles & Security Bypass

| Profile | JWT Enforced | Org Auth Enforced | Debug Logging |
|---------|-------------|-------------------|---------------|
| `local` | ❌ Bypassed | ❌ Bypassed | ✅ Full |
| `dev` | ❌ Bypassed | ❌ Bypassed | ✅ Full |
| `stage` | ✅ Active | ✅ Active | Partial |
| `prod` | ✅ Active | ✅ Active | Minimal |

---

## 7. Data Layer

- **ORM:** Hibernate 6 via Spring Data JPA
- **Schema management:** `ddl-auto: update` (⚠️ no Flyway/Liquibase)
- **Auditing:** Hibernate Envers (`_history` suffix tables)
- **ID strategies:**
  - `BaseEntity` — `Long` auto-increment (`@GeneratedValue(IDENTITY)`)
  - `NewBaseEntity` — 10-char truncated UUID string
- **JSONB support:** Hypersistence `JsonType` for complex nested objects
- **Caching:** Redis with 14+ named caches, TTLs from 1h to 60 days

---

## 8. Deployment

### Docker (multi-stage)

| Stage | Base Image | JVM Memory | New Relic |
|-------|-----------|------------|-----------|
| dev | openjdk-19 (GCP Artifact Registry) | 1GB | ❌ |
| stage | openjdk-19 | 1.5-2.5GB | ✅ |
| prod | openjdk-19 | 1.5-2GB | ✅ |

### CI/CD (Jenkins → GKE)

```
git push → Jenkins pipeline → Gradle build → Spotless check →
  Docker build (arm64) → Push to GCP Artifact Registry →
    kubectl deploy to GKE namespace → Slack notification
```

- **No tests run in pipeline** ⚠️
- **No DB migrations in pipeline** ⚠️
- Separate pipelines for dev, stage, prod

### Runtime Configuration

| Setting | Value |
|---------|-------|
| Server port | 8900 |
| Max upload size | 100MB |
| Timezone | `Asia/Kolkata` (hardcoded) |
| Lazy initialization | Enabled |
| Async thread pools | 4 pools (general, migration, folder, default) |

---

## 9. Key Architectural Decisions & Patterns

| Pattern | Implementation | Notes |
|---------|---------------|-------|
| **Modular monolith** | 58 feature packages | No module boundary enforcement |
| **Interface/Impl** | Service interfaces + implementations | Consistent across all features |
| **Projection queries** | 59 JPA projections | Optimized reads, but many use native SQL |
| **Event-less architecture** | Direct service calls | No domain events; timeline couples directly |
| **Feign inter-service** | Synchronous REST calls | No circuit breakers visible |
| **Redis Pub/Sub** | WebSocket broadcast relay | Cross-pod chat message delivery |
| **STOMP/SockJS** | Real-time chat | JWT auth on CONNECT, participant auth on SUBSCRIBE |
| **Quartz JDBC** | Scheduled reminders | Persistent job store in PostgreSQL |

---

## 10. Known Limitations

1. **Effectively a monolith** — 2,285 files in one service with 35+ circular dependency pairs
2. **Near-zero test coverage** — 2 test files; any optimization carries high regression risk
3. **No schema migration tooling** — `ddl-auto: update` in all environments including production
4. **Secrets in source code** — JWT key, AWS credentials, DB passwords committed to YAML
5. **Hardcoded timezone** — `Asia/Kolkata` limits internationalization
6. **No circuit breakers** — Feign calls to other services have no fallback/retry (except Google Drive)
7. **Extreme EAGER loading** — Patient (7 EAGER), AlignerJourney (8 EAGER) cause N+1 cascades

---

*See also:*
- [API Inventory](./02-API-INVENTORY.md)
- [Data Model](./03-DATA-MODEL.md)
- [Dependency & Integration Map](./04-DEPENDENCY-INTEGRATION-MAP.md)
- [Technical Debt & Risk Register](./05-TECHNICAL-DEBT-REGISTER.md)
- [Module Dependency Graph](./06-MODULE-DEPENDENCY-GRAPH.md)
