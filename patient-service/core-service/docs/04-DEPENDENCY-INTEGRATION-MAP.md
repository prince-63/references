# Dependency & Integration Map — core-service

> **Last updated:** 30 March 2026  
> **External integrations:** 10  
> **Feign clients:** 3 (71+ methods total)  
> **Cache names:** 14+  
> **Async thread pools:** 4

---

## 1. System Integration Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        core-service (:8900)                          │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ REST API │  │WebSocket │  │ Quartz   │  │ @Async Workers    │   │
│  │ (~470    │  │ STOMP    │  │ Scheduler│  │ (4 thread pools)  │   │
│  │ endpts)  │  │          │  │          │  │                   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬──────────┘   │
│       │              │             │                  │              │
│       └──────────────┴─────────────┴──────────────────┘              │
│                              │                                       │
├──────────────────────────────┼───────────────────────────────────────┤
│               OUTBOUND INTEGRATIONS                                  │
│                              │                                       │
│  ┌───── Feign (sync) ───────┼────────────────────────────────────┐  │
│  │                          │                                    │  │
│  │  ┌─────────────────┐  ┌─┴───────────────┐  ┌──────────────┐ │  │
│  │  │  auth-service    │  │ doctor-service   │  │ chat/notif-  │ │  │
│  │  │  (5 methods)     │  │ (16 methods)     │  │ service      │ │  │
│  │  │                  │  │                  │  │ (50+ methods)│ │  │
│  │  │ • org validate   │  │ • doctor details │  │ • email      │ │  │
│  │  │ • user CRUD      │  │ • practices      │  │ • SMS        │ │  │
│  │  │ • deactivate     │  │ • organizations  │  │ • WhatsApp   │ │  │
│  │  │                  │  │ • invitations    │  │ • push notif │ │  │
│  │  └─────────────────┘  └──────────────────┘  │ • chat ops   │ │  │
│  │                                              │ • consent    │ │  │
│  │                                              └──────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───── Data Stores ────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌───────────┐  ┌─────────────────────┐   │   │
│  │  │  PostgreSQL   │  │   Redis   │  │      AWS S3         │   │   │
│  │  │  (JPA+Quartz  │  │ (cache +  │  │  (files, gallery,   │   │   │
│  │  │   +Envers)    │  │  WS relay)│  │   blogs, FAQs)      │   │   │
│  │  └──────────────┘  └───────────┘  └─────────────────────┘   │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────┐                        │   │
│  │  │        Google Drive API v3       │                        │   │
│  │  │  (OAuth2, file storage,          │                        │   │
│  │  │   migration target from S3)      │                        │   │
│  │  └──────────────────────────────────┘                        │   │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───── Third-Party APIs ───────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ┌─────────────┐  ┌───────────────┐  ┌──────────────────┐   │   │
│  │  │  Chargebee   │  │  TensorZero   │  │ Google Gemini    │   │   │
│  │  │  (billing &  │  │  (LLM gateway │  │ (embeddings for  │   │   │
│  │  │  subscript.) │  │   for RAG)    │  │  RAG search)     │   │   │
│  │  └─────────────┘  └───────────────┘  └──────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Feign Clients (Detailed)

### 2.1 ChatServiceClient → notification-service (50+ methods)

**Target URL:** `https://notification.stage.dental-stack.com`  
**Configuration:** Custom `FeignRequestInterceptor` forwards headers.

| Category | Methods | Path Prefix | Description |
|----------|---------|-------------|-------------|
| **VSP Emails** | 12 | `/mail/vsp/v1/` | Case assigned, submitted, files uploaded, plan ready/approved, revision requested, shipped, delivered, production order, order status |
| **Planning Emails** | 7 | `/mail/planning/v1/` | Case assigned, submitted, plan ready/approved, in review, STL uploaded, order status |
| **Patient Emails** | 6 | `/mail/` | Invitation, connected, draft saved, acceptance, practice mail, welcome |
| **Subscription Emails** | 6 | `/mail/` | Subscription created, upgraded, cancelled, renewed, trial ending, payment failed |
| **Treatment Emails** | 4 | `/mail/` | Treatment started, plan shared, plan approved/rejected |
| **Order Emails** | 6 | `/mail/` | Order created, status update, batch update, label update, cancelled |
| **Consent Emails** | 2 | `/consent/email/v1/` | Send to accepter, copy to admin (multipart) |
| **Doctor Invitation** | 1 | `/mail/` | Doctor invitation email |
| **SMS** | 5 | `/sms/v1/` | To patient (generic, connected), to doctor (aligner change, generic), appointment reminder |
| **WhatsApp** | 1 | `/whatsapp/v1/` | Send template message |
| **Notifications** | 1 | `/notification/v1/` | Push notification |
| **Chat Operations** | 5 | `/chat/v1/` | Create chat, add/remove participant, mark read, send message |

> ⚠️ **50+ methods in a single Feign client** — extremely tight coupling. No circuit breaker, fallback, or retry configured.

### 2.2 DoctorServiceClient → doctor-service (16 methods)

**Target URL:** `https://doctor.stage.dental-stack.com`

| Method | HTTP | Path | Description |
|--------|------|------|-------------|
| getDoctorDetails | GET | `/api/v1/doctor` | Get doctor by ID |
| getDoctorsByIds | POST | `/api/v1/doctor/by-ids` | Bulk get doctors |
| getDoctorDetailsByProfileIds | POST | `/api/v1/doctor/by-profile-ids` | Bulk get by profiles |
| getProfileByDoctorId | GET | `/api/v1/doctor/profile` | Get profile by doctor |
| getProfilesByOrganizationId | GET | `/api/v1/doctor/organization-profiles` | Get org profiles |
| getProfilesByOrganizationId | GET | `/api/v1/doctor/organization-profiles` | Overload (list) |
| getOrganizationsByProfileIds | GET | `/api/v1/doctor/organizations-by-profiles` | Get orgs by profiles |
| getPracticeLocationById | GET | `/api/v1/doctor/practice-location` | Get practice location |
| getInvitationDetails | GET | `/api/v1/doctor/invitation/{doc}/{pat}` | Get invitation details |
| addPracticeDoctor | POST | `/api/v1/doctor/practice/add-doctor` | Add practice doctor |
| getProfileById | GET | `/api/v1/doctor/profile/by-id` | Get profile by ID |
| getConnectionStatusOfPatient | GET | `/api/v1/doctor/connection-status` | Get patient connection |
| deactivateProfile | POST | `/api/v1/doctor/profile/deactivate` | Deactivate profile |
| getPracticeLocationsByProfileId | GET | `/api/v1/doctor/practice-locations/{id}` | Get practice locations |
| addPracticeDoctorIfNotExist | POST | `/api/v1/doctor/practice/add-if-not` | Add if not exists |
| activateOrCreateProfile | POST | `/api/v1/doctor/profile/activate-or-create` | Activate or create |

### 2.3 AuthServiceClient → auth-service (5 methods)

**Target URL:** `https://auth.stage.dental-stack.com`

| Method | HTTP | Path | Description |
|--------|------|------|-------------|
| updateUserEmail | PUT | `/api/v1/user/email` | Updates user email |
| deleteUser | POST | `/api/v1/user/{id}/deactivate` | Deactivates user |
| deleteUserPermanently | DELETE | `/api/v1/user/{id}` | Permanent delete |
| validateOrganization | GET | `/api/v1/auth/organization/validate` | Validates org (headers) |
| getUserProfile | GET | `/api/v1/user/profile/{id}` | Gets user profile |

---

## 3. Feign Configuration

### FeignRequestInterceptor
Forwards these headers from incoming requests to outbound Feign calls:
- `Authorization`
- `X-Organization-Name`, `X-Organization-Token`
- `organization_id` / `Organization-id` / `organization-id`
- `User-Id`
- `profile_id` / `Profile-id` / `Profile_id`

### Feign Timeouts (stage profile)
- Connect timeout: 5,000ms
- Read timeout: 5,000ms

> ⚠️ **No circuit breakers** — If notification-service goes down, core-service endpoints that send notifications will fail and block for 5s per call.

---

## 4. Caching Architecture

### Redis Configuration
- **Host:** `prod-ds-common-redis.dental-stack.com:6379`
- **Client:** Lettuce
- **Database:** 6 (stage profile)
- **Serialization:** JSON with polymorphic type info
- **Default TTL:** 1 hour

### Cache Names & Details

| Cache Name | TTL | Location | Key Pattern | Description |
|-----------|-----|----------|-------------|-------------|
| `countries` | 60d | LocationService | default | All countries |
| `citiesByStateAndCountry` | 60d | LocationService | state+country | Cities lookup |
| `statesByCountry` | 60d | LocationService | country | States lookup |
| `clearAlignersList` | 1h | AlignerServiceImpl | doctorId | Aligner journey list |
| `alignerJourneysByDoctorId` | 1h | AlignerServiceImpl | doctorId | Journeys per doctor |
| `activeAlignerJourneys` | 1h | AlignerServiceImpl | doctorId | Active journeys |
| `alignerActionDetailsPerPatient` | 1h | AlignerActionService | patientId | Action details |
| `alignerAnalyticsChartCountForDoctor` | 1h | AlignerAnalyticsService | doctorId | Analytics chart |
| `getDoctorAllInvitation` | 1h | InvitationService | doctorId | Doctor invitations |
| `patientAccordingToAlignerFilter` | 1h | AlignerServiceImpl | filter hash | Filtered patients |
| `getCategorizedAlignerActionDetailsDashboard` | 1h | AlignerActionService | dashboardId | Dashboard actions |
| `getAlignerProductionOrders` | 1h | AlignerProductionService | journeyId | Production orders |
| `doctorDashboardCount` | 1h | DoctorDashboardService | orgId_roles | Dashboard counts |
| `getUnprocessedAlignerList` | 1h | UnprocessedAlignerService | orgId_roles | Unprocessed list |

### Eviction Strategy

**AlignerCacheEvictionServiceImpl** — Evicts **12 caches simultaneously** when aligner data changes:
```
clearAlignersList, alignerJourneysByDoctorId, activeAlignerJourneys,
alignerActionDetailsPerPatient, alignerAnalyticsChartCountForDoctor,
getDoctorAllInvitation, patientAccordingToAlignerFilter,
getCategorizedAlignerActionDetailsDashboard, getAlignerProductionOrders,
doctorDashboardCount, getUnprocessedAlignerList, (+ related)
```

**DashboardCacheService** — Pattern-based eviction using `RedisTemplate`:
- Evicts keys matching `doctorDashboardCount::orgId_*`
- Evicts keys matching `getUnprocessedAlignerList::orgId_*`

> ⚠️ **Cache invalidation complexity** — Evicting 12 caches on every aligner mutation is fragile. Any new cache added to the system must also be registered in the eviction service.

---

## 5. WebSocket Architecture

### Configuration
- **Broker type:** Simple in-memory message broker
- **STOMP destinations:** `/topic`, `/queue`
- **Application prefix:** `/app`
- **User destination prefix:** `/user`
- **Transport limits:** 512KB send buffer, 20s send timeout, 128KB max incoming

### Endpoints

| Endpoint | SockJS | Purpose |
|----------|--------|---------|
| `/ws-chat` | ✅ | General chat WebSocket |
| `/patient/ws-chat` | ✅ | Patient-specific chat WebSocket |

### Message Flow

```
Client                    Server                      Redis
  │                         │                           │
  ├─ CONNECT (JWT) ────────►│ validate JWT              │
  │                         │ set principal              │
  │                         │                           │
  ├─ SUBSCRIBE ────────────►│ validate participant      │
  │  /topic/chat.{id}      │ via ChatParticipant        │
  │                         │                           │
  ├─ SEND ─────────────────►│ @MessageMapping           │
  │  /app/chat.send         │  handleSendMessage        │
  │                         │                           │
  │                         ├─ REST: save message       │
  │                         ├─ PUBLISH ────────────────►│ chat-broadcast
  │                         │                           │
  │                         │◄─ SUBSCRIBE ──────────────┤ chat-broadcast
  │                         │  (all pods)               │
  │◄─ /topic/chat.{id} ────┤ relay to local sessions   │
  │                         │                           │
```

### Cross-Pod Broadcasting (Redis Pub/Sub)
- **Channel:** `chat-broadcast`
- `ChatBroadcastRedisConfig` — configures `RedisMessageListenerContainer`
- Each pod subscribes to the channel on startup
- Incoming messages are relayed to local WebSocket sessions

---

## 6. Async Thread Pools

| Pool Name | Core | Max | Queue | Prefix | Used By |
|-----------|------|-----|-------|--------|---------|
| General | 8 | 20 | 200 | `async-exec-` | General @Async methods |
| Migration | 5 | 10 | 100 | `migration-exec-` | S3→GDrive file migration |
| Folder Creation | 5 | 10 | 100 | `folder-creation-` | Google Drive folder ops |
| Default (Spring) | 10 | 50 | 100 | `task-exec-` | Default Spring async |

---

## 7. Scheduled Tasks

| Task | Schedule | Location | Description |
|------|----------|----------|-------------|
| ApiRegistryInitializer.flush | Every 60s (`@Scheduled`) | ApiUsageInterceptor | Flushes API hit counters to DB |

### Quartz Jobs (JDBC Job Store)
- **Job store type:** JDBC (PostgreSQL delegate)
- **Table prefix:** `QRTZ_`
- **Overwrite existing:** true
- **Cluster mode:** not explicitly configured

Quartz schedules (from YAML):
| Job | Cron Expression | Time |
|-----|----------------|------|
| Daily aligner notification | `0 0 9 1/1 * ? *` | Daily 9:00 AM |
| Morning reminder | `0 15 9 1/1 * ? *` | Daily 9:15 AM |
| Midday check | `0 0 10 1/1 * ? *` | Daily 10:00 AM |
| Frequent check | `0 0/10 * 1/1 * ? *` | Every 10 min |
| Rapid check | `0/1 * * * * ?` | Every second (⚠️) |

---

## 8. AWS S3 Integration

### Configuration
- **Region:** ap-south-1
- **Buckets:** `dental-stack-stage-*` (files, blog, gallery, faq, patient)
- **Access:** IAM access key + secret key (⚠️ hardcoded in YAML)

### Usage Patterns
| Bucket Pattern | Feature | Operations |
|---------------|---------|------------|
| `dental-stack-stage-files` | File storage | Upload, download, delete |
| `dental-stack-stage-blog` | Blog images | Upload |
| `dental-stack-stage-gallery` | Patient photos | Upload, download, delete |
| `dental-stack-stage-faq` | FAQ images | Upload |
| `dental-stack-stage-patient` | Patient data | Upload, download |

### S3 → Google Drive Migration
- **Strategy pattern:** `MigrationStrategy` interface with profile-based implementation
- **Workers:** Async thread pool for parallel migration
- **Tracking:** `MigrationJob` entity tracks progress
- **Cleanup:** `S3CleanupController` removes migrated files

---

## 9. Google Drive Integration

### OAuth2 Flow
1. User triggers `/patient/drive/authorize`
2. Redirect to Google OAuth consent screen
3. Callback at `/patient/drive/authorized`
4. Tokens stored in DB (`GoogleDriveToken` entity)
5. Auto-refresh via `GoogleDriveService`

### Configuration
- **App name:** Dental Stack
- **Scopes:** `DriveScopes.DRIVE` (full access)
- **Credentials:** `credentials.json` in classpath (⚠️ committed)
- **Redirect URI:** `http://localhost:8900/patient/drive/authorized`
- **Frontend redirect:** `https://web.stage.dental-stack.com`

### Retry Policy
- `RetryExecutor(3, 1000, 8000)` — 3 retries, 1s initial delay, 8s max

---

## 10. Chargebee Integration

### Configuration
- **Site:** Configured per profile
- **API Key:** ⚠️ Hardcoded in YAML
- **SDK:** Chargebee Java SDK

### Operations
| Operation | Location | Description |
|-----------|----------|-------------|
| createCustomer | SubscriptionServiceImpl | Creates Chargebee customer |
| addBasicPlan | SubscriptionServiceImpl | Assigns basic subscription |
| extendSubscription | SubscriptionPlanService | Extends current plan |
| webhooks | SubscriptionController | Handles Chargebee events |

---

## 11. AI / LLM Integration

### TensorZero Gateway
- **Enabled:** `tensorzero.enabled=true`
- **Gateway URL:** `http://localhost:4001`
- **Function:** `rag_chat`
- **Purpose:** RAG-based chat for treatment insights

### Google Gemini
- **Model:** `gemini-embedding-001`
- **Dimensions:** 768
- **API Key:** ⚠️ Hardcoded in YAML (`AIzaSy...`)
- **Purpose:** Document embeddings for RAG search

---

## 12. Security Filter Chain

```
Request → ContentCachingFilter (order: -200)
       → OrganizationAuthFilter (X-Organization-* headers)
       → JWTAuthenticationFilter (Authorization: Bearer)
       → Spring Security filters
       → DoctorAuthorizationInterceptor (MVC)
       → ApiUsageInterceptor (MVC)
       → Controller
```

### Auth Bypass Rules
| Profile | JWT | OrgAuth | DoctorAuth |
|---------|-----|---------|------------|
| local | ❌ Skip | ❌ Skip | ❌ Skip |
| dev | ❌ Skip | ❌ Skip | ❌ Skip |
| stage | ✅ Active | ✅ Active | ✅ Active |
| prod | ✅ Active | ✅ Active | ✅ Active |

### CORS Origins
```
https://app.dental-stack.com
https://web.dental-stack.com
https://web.stage.dental-stack.com
https://app.stage.dental-stack.com
https://app.dev.dental-stack.com
https://web.dev.dental-stack.com
http://localhost:3000
http://localhost:8000
http://localhost:*
```

---

## 13. Monitoring & Observability

| Tool | Coverage | Notes |
|------|----------|-------|
| **New Relic** | stage, prod | Java agent attached in Docker |
| **Spring Actuator** | stage | health, info, metrics, env, beans exposed |
| **AOP Logging** | local only | LoggingAspect logs method entry/exit |
| **API Registry** | prod | Tracks API hit counts per endpoint |

### Missing Observability
- ❌ No distributed tracing (Sleuth/Micrometer)
- ❌ No structured logging (JSON format)
- ❌ No Feign call metrics
- ❌ No cache hit/miss metrics
- ❌ No database query timing

---

## 14. Exception Handling

### Global Exception Handler
`RestResponseEntityExceptionHandler` (@ControllerAdvice) — **439 lines, 60+ exception types**

| HTTP Status | Exception Categories |
|-------------|---------------------|
| **400 Bad Request** | ~55 domain exceptions (Patient*, Aligner*, Invitation*, Treatment*, Appointment*, Workflow*, etc.) + ConstraintViolationException + MethodArgumentNotValid |
| **403 Forbidden** | ForbiddenException |
| **500 Internal Server Error** | FailedToUpload*, FailedToSchedule*, FailedToMove*, FailedToDownload*, generic Exception catch-all |

**Response format:** `ErrorInfo { message, timestamp, errorCode? }`

---

*See also:*
- [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)
- [Data Model](./03-DATA-MODEL.md)
- [Technical Debt Register](./05-TECHNICAL-DEBT-REGISTER.md)
- [Module Dependency Graph](./06-MODULE-DEPENDENCY-GRAPH.md)
