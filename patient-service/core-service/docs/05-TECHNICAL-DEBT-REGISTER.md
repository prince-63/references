# Technical Debt Register — core-service

> **Last updated:** 30 March 2026  
> **Total items:** 32 (9 resolved)  
> **Critical:** 8 (3 ✅) | **High:** 10 (2 ✅) | **Medium:** 9 | **Low:** 5

---

## Severity Legend

| Level | Impact | Fix Effort | Fix Urgency |
|-------|--------|-----------|-------------|
| 🔴 **Critical** | Production risk, security exposure, data loss potential | Varies | Immediate |
| 🟠 **High** | Significant perf/maintenance burden, DX impact | Medium–High | Next sprint |
| 🟡 **Medium** | Moderate quality/maintainability impact | Low–Medium | Quarter |
| 🟢 **Low** | Minor quality issue, nice-to-have | Low | Backlog |

---

## 🔴 CRITICAL — Fix Immediately

### TD-001: Hardcoded Secrets in YAML & Source

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Category** | Security |
| **Location** | `application.yml`, `application-stage.yml`, `application-local.yml` |
| **Impact** | Full database access, API keys, JWT signing key exposed in VCS |
| **Effort** | Medium (2–3 days) |

**Details:**  
Plaintext secrets committed to repository:
- **JWT signing key** — HMAC-SHA256 secret in `application.yml`
- **PostgreSQL passwords** — All profiles (local, stage)
- **AWS access key + secret** — IAM credentials for S3
- **Chargebee API key** — Billing system access
- **Google Gemini API key** — AI API access (`AIzaSy...`)
- **Redis password** — Cache/messaging access

**Remediation:**  
1. Rotate ALL compromised credentials immediately  
2. Move secrets to Kubernetes Secrets or HashiCorp Vault  
3. Use `${ENV_VARIABLE}` references in YAML  
4. Add `*.yml` secret scanning to CI pipeline  
5. Add `.gitignore` rules for credential files

---

### TD-002: Google OAuth2 Credentials Committed

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Category** | Security |
| **Location** | `src/main/resources/credentials.json`, `client_secret_*.json` |
| **Impact** | Google OAuth client compromise, unauthorized API access |
| **Effort** | Low (1 day) |

**Details:**  
Google OAuth2 client secret JSON files are committed directly in the classpath resources.

**Remediation:**  
1. Remove from VCS, add to `.gitignore`  
2. Mount as Kubernetes Secret volume  
3. Rotate client secret in Google Cloud Console

---

### TD-003: ddl-auto: update in ALL Profiles

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Category** | Data Integrity |
| **Location** | `application.yml` (all profiles) |
| **Impact** | Uncontrolled schema changes on deployment, potential data loss, no rollback |
| **Effort** | High (1–2 weeks) |

**Details:**  
`spring.jpa.hibernate.ddl-auto: update` is set globally and not overridden in any profile. Hibernate auto-applies schema changes on every boot:
- No migration history
- No rollback capability
- Can silently widen columns
- Can add columns but never drops them (schema drift)
- Concurrent pod startups could race on DDL

**Remediation:**  
1. Generate baseline migration from current schema  
2. Integrate Flyway or Liquibase  
3. Set `ddl-auto: validate` in stage/prod  
4. Add CI step to validate migrations

---

### TD-004: Near-Zero Test Coverage

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Category** | Quality |
| **Location** | `src/test/java/` — only 2 test files |
| **Impact** | No regression safety net for 2,285 source files |
| **Effort** | Very High (ongoing) |

**Details:**  
Only 2 test files exist for ~2,285 source files:
- `CoreServiceApplicationTests.java` — Spring context load test
- One other minimal test

Entire business logic (aligner workflows, subscriptions, billing, scheduling, migrations) has zero automated test coverage.

**Remediation:**  
1. Establish minimum coverage gate (start at 10%, target 60%)  
2. Prioritize tests for: billing, aligner state transitions, patient CRUD  
3. Add integration tests for Feign client contracts  
4. Add repository tests for complex native queries  
5. Add test stage to Jenkins pipeline

---

### TD-005: Security Bypass in dev/local Profiles

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Category** | Security |
| **Location** | JWT filter, OrgAuth filter, DoctorAuth interceptor |
| **Impact** | All auth bypassed — any request accepted without token |
| **Effort** | Low (1–2 days) |

**Details:**  
In `local` and `dev` profiles, security filters short-circuit:
```
if (profile == "local" || profile == "dev") { chain.doFilter(); return; }
```
If a production pod accidentally starts with a dev profile, all endpoints become unauthenticated.

**Remediation:**  
1. Use mock auth service instead of bypassing  
2. Add startup validation to reject dev profile in Kubernetes  
3. Use Spring Security test support for integration tests

---

### TD-006: 48 EAGER FetchType Relations ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical → ✅ Resolved |
| **Category** | Performance |
| **Location** | Patient (7), AlignerJourney (8), Aligner (4), TreatmentPlan (5), others |
| **Impact** | N+1 queries, excessive memory, slow list endpoints |
| **Effort** | High (2–3 weeks, requires careful testing) |
| **Resolved** | All 50+ EAGER→LAZY across 29 entity files. 0 EAGER remaining in core-service. |

**Details:**  
48 EAGER-loaded relationships across the entity graph. The worst offenders:

| Entity | EAGER Count | Cascading Load |
|--------|------------|-----------------|
| Patient | 7 | Loads user, location, file, subscription |
| AlignerJourney | 8 | Loads patient (→7 more), plans, latest aligner |
| Aligner | 4 | Loads journey (→8 more + patient) |
| TreatmentPlan | 5 | Loads journey, aligners |
| PatientTaskTracker | 3 | Loads patient |

Loading a single `AlignerJourney` triggers a cascade: journey → patient (7 EAGER) → user + location + subscription → potentially 20+ queries.

**Remediation:**  
1. Change all to `FetchType.LAZY`  
2. Use `@EntityGraph` or `JOIN FETCH` for specific use cases  
3. Create query-specific projections (59 already exist)  
4. Test each change against existing callers  
5. Monitor query count before/after with Hibernate statistics

---

### TD-007: AlignerJourneyRepository — 1,100 Lines of Native SQL ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical → ✅ Resolved |
| **Category** | Maintainability |
| **Location** | `AlignerJourneyRepository.java` → decomposed into 3 repositories |
| **Impact** | Unmaintainable queries, high bug risk, no compile-time validation |
| **Effort** | High (2 weeks) |
| **Resolved** | Decomposed into `AlignerJourneyRepository` (core CRUD + JPQL, ~250 lines), `AlignerAnalyticsQueryRepository` (analytics native SQL), `AlignerProductionQueryRepository` (manufacturing queries). |

**Details:**  
Single repository file with 1,100+ lines, dominated by complex native SQL queries with string concatenation. Many queries span 50–100 lines with nested subqueries and conditional filtering.

**Resolution:**  
1. Created `AlignerAnalyticsQueryRepository` — all compliance counts, change timing, fit quality, issue analytics, patient summaries (paginated + search), remind-all  
2. Created `AlignerProductionQueryRepository` — manufacturing batch eligibility queries  
3. Original `AlignerJourneyRepository` retains core CRUD, simple findBy* methods, journey summaries, and JPQL queries  
4. Callers should be migrated to use the appropriate sub-repository

---

### TD-008: No Circuit Breakers on Feign Clients ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical → ✅ Resolved |
| **Category** | Resilience |
| **Location** | ChatServiceClient, DoctorServiceClient, AuthServiceClient |
| **Impact** | Cascading failures if any downstream service is slow/down |
| **Effort** | Medium (3–5 days) |
| **Resolved** | Added Resilience4j circuit breaker, fallback classes, retry with exponential backoff, bulkhead isolation for all 3 Feign clients. |

**Details:**  
All 3 Feign clients had no circuit breaker, fallback, retry, or bulkhead.

**Resolution:**  
1. Added `spring-cloud-starter-circuitbreaker-resilience4j` dependency  
2. Enabled `spring.cloud.openfeign.circuitbreaker.enabled: true`  
3. Created fallback classes: `ChatServiceClientFallback`, `DoctorServiceClientFallback`, `AuthServiceClientFallback`  
4. Configured per-client circuit breaker (sliding window, failure rate, wait duration)  
5. Configured retry with exponential backoff (3 attempts, 500ms base, 2x multiplier)  
6. Configured bulkhead isolation (chat: 30, doctor: 15, auth: 10 concurrent calls)  
7. Configured time limiter (chat: 8s, doctor/auth: 5s)

---

## 🟠 HIGH — Plan for Next Sprint

### TD-009: AlignerJourney.java — 836 Lines God Entity ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High → ✅ Resolved |
| **Category** | Maintainability |
| **Location** | `AlignerJourney.java` → `AlignerJourneyDomainService.java` |
| **Impact** | Entity contains business logic, hard to test, modify, or reason about |
| **Effort** | High (1–2 weeks) |
| **Resolved** | 25+ business methods extracted to `AlignerJourneyDomainService.java`. Entity retains only JPA fields/annotations. |

**Details:**  
AlignerJourney (836 lines) was the largest entity with: 8 EAGER relations, 67+ fields, inline business logic methods, multiple lifecycle callbacks.

**Resolution:**  
Created `AlignerJourneyDomainService` with all calculation, validation, mutation, and query logic. Entity is now a pure data holder. Callers should be migrated to use the new service instead of entity methods.

---

### TD-010: PatientTaskTracker.java — 545 Lines ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High → ✅ Resolved |
| **Category** | Maintainability |
| **Location** | `PatientTaskTracker.java` → `PatientTaskTrackerDomainService.java` |
| **Impact** | Overloaded entity |
| **Effort** | Medium (1 week) |
| **Resolved** | 8 static factory methods + buildPatientTaskResponse extracted to `PatientTaskTrackerDomainService.java`. |

---

### TD-011: ChatServiceClient — 50+ Methods Tight Coupling

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Architecture |
| **Location** | `ChatServiceClient.java` |
| **Impact** | Every notification type is a synchronous blocking call |
| **Effort** | High (2–3 weeks) |
| **Resolved** | External modules no longer inject `ChatServiceClient` directly. `addChatEvent` added to `ChatService` facade. 3 external callers migrated: `AlignerActionServiceImpl`, `AlignerActionV2ServiceImpl`, `ChatMessageServiceImpl` now use `ChatService` interface. `ChatServiceClient` usage contained within `notification` package only. |

**Details:**  
50+ methods mean core-service knows intimate details of notification-service's API. Adding a notification type requires changing both services.

**Remediation:**  
1. Publish domain events (e.g., `AlignerStatusChanged`) to a message broker  
2. Let notification-service subscribe and decide what to send  
3. Reduce Feign client to ≤5 generic methods

---

### TD-012: 35+ Circular Dependency Pairs

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Architecture |
| **Location** | See [Module Dependency Graph](./06-MODULE-DEPENDENCY-GRAPH.md) |
| **Impact** | Modules cannot be extracted, tested, or reasoned about independently |
| **Effort** | Very High (multi-sprint) |
| **Resolved** | Created `TimelineEvent` + `TimelineEventListener` event infrastructure in `global.event` package. `ChatMessageServiceImpl` migrated from direct `TimelineService` dependency to `ApplicationEventPublisher` + async event listener. Pattern established for gradual migration of remaining 20+ callers. |

**Top cycles by import count:**
1. aligner ↔ timeline — 151 imports
2. patient ↔ timeline — 125 imports
3. aligner ↔ patient — 105 imports
4. patient ↔ doctor — 76 imports
5. patient ↔ invitation — 76 imports

---

### TD-013: Hardcoded Timezone (Asia/Kolkata)

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Functionality |
| **Location** | `@PostConstruct` in main application class |
| **Impact** | All date/time logic forced to IST; breaks for international users |
| **Effort** | Medium (1 week) |
| **Resolved** | Created `TimezoneConfig.java` utility in `global.config`. Replaced 25 occurrences of `ZoneId.of("Asia/Kolkata")` across 10 files with `TimezoneConfig.DEFAULT_ZONE_ID`. Updated 2 payment DTOs to use `TimezoneConfig.DEFAULT_TIMEZONE_ID`. Migration path documented: Phase 1 (centralize) → Phase 2 (per-org) → Phase 3 (UTC internally). |

**Remediation:**  
1. Store timezone per organization  
2. Use UTC internally, convert at API boundary  
3. Remove `TimeZone.setDefault()` call

---

### TD-014: Cache Eviction Fragility (12 Caches at Once)

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Architecture |
| **Location** | `AlignerCacheEvictionServiceImpl` |
| **Impact** | Missing a cache causes stale data; evicting all 12 causes cache stampede |
| **Effort** | Medium (1 week) |
| **Resolved** | Removed 4 duplicate `@CacheEvict` entries. Split monolithic 12-cache eviction into `evictJourneyCaches` (3 caches), `evictDashboardCaches` (4 caches), `evictListCaches`, and `evictProductionCache`. `evictAlignerAction` and `evictLeadData` now have real `@CacheEvict` annotations (were no-ops). `evictAllAlignerCaches` provides backward-compatible nuclear option. `PatientProfileServiceImpl` caller simplified from 15 lines to 1 line. |

**Remediation:**  
1. Use cache tags / key namespacing  
2. Implement fine-grained eviction (only related caches)  
3. Add cache hit/miss monitoring

---

### TD-015: RestResponseEntityExceptionHandler — 439 Lines, 60+ Types

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Maintainability |
| **Location** | `RestResponseEntityExceptionHandler.java` |
| **Impact** | New features always add more exceptions; inconsistent error responses |
| **Effort** | Medium (1 week) |

**Remediation:**  
1. Create exception hierarchy (e.g., `DomainException extends RuntimeException`)  
2. Use single handler method with error code mapping  
3. Standardize error response format (RFC 7807 Problem Details)

---

### TD-016: No API Versioning Strategy

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Architecture |
| **Location** | Various controllers |
| **Impact** | Inconsistent: v1, v2, v5 exist; most endpoints unversioned |
| **Effort** | Medium |

**Details:**  
- Most endpoints: `/api/patient/…` (no version)
- Some: `/api/v1/…`, `/api/v2/…`
- One jump to `/api/v5/…`
- No deprecation headers or sunset policy

---

### TD-017: 145 Enums — Many Duplicated or Overloaded

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Maintainability |
| **Location** | Various packages |
| **Impact** | Enum proliferation, status enums with 20+ values |
| **Effort** | Medium (1 week) |

---

### TD-018: Missing Index Annotations

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Performance |
| **Location** | Most entities |
| **Impact** | Queries on foreign keys and filter columns may do full table scans |
| **Effort** | Low (2–3 days + testing) |

**Remediation:**  
1. Analyze slow query log  
2. Add `@Index` for commonly queried foreign keys  
3. Add composite indexes for dashboard queries

---

## 🟡 MEDIUM — Fix This Quarter

### TD-019: No Flyway/Liquibase Migration System

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | DevOps |
| **Location** | `application.yml` |
| **Effort** | High (1–2 weeks, related to TD-003) |

---

### TD-020: No Checkstyle / PMD / SpotBugs

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Quality |
| **Location** | `build.gradle` — only Spotless configured |
| **Impact** | Code formatting enforced, but no bug/smell detection |
| **Effort** | Low (1–2 days) |

---

### TD-021: No Structured Logging

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Observability |
| **Location** | Application-wide |
| **Impact** | Logs not machine-parseable, no correlation IDs |
| **Effort** | Medium (3–5 days) |

**Remediation:**  
1. Add `logback-logstash-encoder`  
2. Configure JSON output for stage/prod  
3. Add MDC context (request ID, org ID, user ID)

---

### TD-022: No Distributed Tracing

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Observability |
| **Location** | All inter-service calls |
| **Impact** | Cannot trace request flow across core ↔ doctor ↔ notification |
| **Effort** | Medium (3–5 days) |

**Remediation:** Add Micrometer Tracing with Zipkin/Jaeger exporter.

---

### TD-023: Docker Build — No Build Cache, No Layer Optimization

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | DevOps |
| **Location** | `docker/Dockerfile` |
| **Impact** | Slow builds, large image size |
| **Effort** | Low (1 day) |

**Remediation:**  
1. Use Gradle build cache  
2. Separate dependency layer from app layer  
3. Use distroless or JRE-only base image

---

### TD-024: Google Drive Redirect URI = localhost

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Configuration |
| **Location** | GoogleDriveService |
| **Impact** | OAuth callback fails in stage/prod unless overridden |
| **Effort** | Low (1 day) |

---

### TD-025: LazyInitializationEnabled = true

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Performance |
| **Location** | `application.yml` |
| **Impact** | Startup time improved but first-request latency unpredictable |
| **Effort** | Low |

---

### TD-026: Every-Second Quartz Job

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Performance |
| **Location** | Quartz cron: `0/1 * * * * ?` |
| **Impact** | 86,400 job executions/day; unnecessary DB polling |
| **Effort** | Low (1 day) |

**Remediation:** Evaluate if polling can be event-driven or reduced to per-minute.

---

### TD-027: 100MB Max Upload Size

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Security |
| **Location** | `application.yml` — `spring.servlet.multipart.max-file-size: 100MB` |
| **Impact** | Large uploads can exhaust memory (ContentCachingFilter caches entire request body) |
| **Effort** | Low |

---

## 🟢 LOW — Backlog

### TD-028: AOP Logging Only in Local Profile

| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Category** | Observability |
| **Impact** | No method-level tracing in stage/prod |

---

### TD-029: Dead Controllers (7 Identified)

| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Category** | Cleanup |
| **Location** | See [API Inventory](./02-API-INVENTORY.md) |
| **Impact** | Code clutter, confusion |
| **Effort** | Low (1 day) |

---

### TD-030: Inconsistent Base Entity Usage

| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Category** | Consistency |
| **Impact** | Some entities use `BaseEntity`, some use `NewBaseEntity`, some have no base |

---

### TD-031: CORS Allows localhost in Stage

| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Category** | Security |
| **Location** | SecurityConfiguration CORS origins |
| **Impact** | `http://localhost:*` in CORS origins for non-local profiles |

---

### TD-032: No Pagination Defaults

| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Category** | Performance |
| **Impact** | Endpoints returning full lists without default page size limits |

---

## Summary by Category

| Category | Count | Critical | High | Medium | Low |
|----------|-------|----------|------|--------|-----|
| Security | 5 | 3 | 0 | 1 | 1 |
| Performance | 5 | 1 | 1 | 2 | 1 |
| Architecture | 4 | 1 | 3 | 0 | 0 |
| Maintainability | 5 | 1 | 3 | 0 | 1 |
| Quality | 2 | 1 | 0 | 1 | 0 |
| Observability | 3 | 0 | 0 | 2 | 1 |
| DevOps | 3 | 1 | 0 | 2 | 0 |
| Data Integrity | 1 | 1 | 0 | 0 | 0 |
| Configuration | 2 | 0 | 1 | 1 | 0 |
| Functionality | 1 | 0 | 1 | 0 | 0 |
| Consistency | 1 | 0 | 0 | 0 | 1 |
| **Total** | **32** | **8** | **10** | **9** | **5** |

---

## Recommended Fix Order

### Sprint 1 (Immediate — Security)
1. **TD-001** Rotate & externalize all secrets
2. **TD-002** Remove Google credentials from VCS
3. **TD-005** Fix security bypass logic

### Sprint 2 (Data Safety)
4. **TD-003** Implement Flyway, set `ddl-auto: validate`
5. **TD-007** Start decomposing native SQL queries

### Sprint 3 (Performance)
6. **TD-006** Convert EAGER → LAZY (start with Patient, AlignerJourney)
7. **TD-018** Add database indexes for hot queries
8. **TD-014** Improve cache eviction granularity

### Sprint 4 (Resilience)
9. **TD-008** Add circuit breakers to Feign clients
10. **TD-011** Decouple notification via events

### Sprint 5+ (Quality & Architecture)
11. **TD-004** Establish test infrastructure and coverage gates
12. **TD-012** Break circular dependencies (start with timeline module)

---

*See also:*
- [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)
- [Data Model](./03-DATA-MODEL.md)
- [Dependency & Integration Map](./04-DEPENDENCY-INTEGRATION-MAP.md)
- [Module Dependency Graph](./06-MODULE-DEPENDENCY-GRAPH.md)
