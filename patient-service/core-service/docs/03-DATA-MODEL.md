# Data Model — core-service

> **Last updated:** 30 March 2026  
> **Total entities:** 80+  
> **Total enums:** 145  
> **Total JPA projections:** 59  
> **Schema management:** `ddl-auto: update` (⚠️ no Flyway/Liquibase)

---

## 1. Base Entities

All domain entities extend one of two base classes:

### BaseEntity (Long auto-increment ID)

```
@MappedSuperclass
BaseEntity implements Serializable
├── id: Long           @GeneratedValue(IDENTITY)
├── createdAt: Date    @CreatedDate
├── updatedAt: Date    @LastModifiedDate
└── version: Long      @Version
```

Used by **~95%** of entities (Patient, AlignerJourney, Aligner, Treatment, Order, etc.)

### NewBaseEntity (10-char UUID string ID)

```
@MappedSuperclass
NewBaseEntity implements Serializable
├── id: String         @PrePersist → IDGenerator.generateId() (10-char truncated UUID)
├── createdAt: Date    @CreatedDate
├── updatedAt: Date    @LastModifiedDate
└── version: Long      @Version
```

Used by: `Order`, `VspOrder`, and other VSP-related entities.

> ⚠️ **Risk:** 10-char truncated UUID has collision risk at scale. UUID truncation from 128 bits to ~48 bits of entropy.

---

## 2. Entity Relationship Diagram (Key Entities)

```
                                    ┌─────────────────┐
                                    │     Doctor       │
                                    │   (doctor_id)    │
                                    └────────┬────────┘
                                             │ 1:N
                          ┌──────────────────┼──────────────────┐
                          ▼                  ▼                  ▼
                 ┌─────────────┐    ┌──────────────┐   ┌──────────────┐
                 │   Patient   │    │  Invitation   │   │   Practice   │
                 │ (patients)  │    │(pat_invit_dep)│   │ Location     │
                 └──┬──┬──┬───┘    └──────────────┘   └──────────────┘
                    │  │  │
        ┌───────────┘  │  └───────────┐
        ▼              ▼              ▼
  ┌───────────┐ ┌────────────┐ ┌──────────┐
  │ Aligner   │ │ Treatment  │ │ Braces   │
  │ Journey   │ │            │ │ Journey  │
  │(al_jrny)  │ │(treatment) │ │(braces)  │
  └─┬──┬──┬───┘ └─────┬─────┘ └──────────┘
    │  │  │            │
    │  │  │     ┌──────▼──────┐
    │  │  │     │ Treatment   │
    │  │  │     │ Plan        │
    │  │  │     │(treat_plan) │
    │  │  │     └─────────────┘
    │  │  │
    │  │  └──────────────────────┐
    │  │                         ▼
    │  │              ┌────────────────────┐
    │  │              │ AlignerProduction  │
    │  │              │   Order            │
    │  │              └────────┬───────────┘
    │  │                       │
    │  │              ┌────────▼───────────┐
    │  │              │ AlignerProduction  │
    │  │              └────────────────────┘
    │  │
    │  ▼
    │  ┌──────────────┐    ┌──────────────┐
    │  │   Aligner    │───▶│AlignerAction │
    │  │  (aligners)  │    │(al_action)   │
    │  └──────┬───────┘    └──────────────┘
    │         │
    │         ├──▶ AlignerFeedback
    │         ├──▶ AlignerPhoto
    │         └──▶ AlignerDailyWearTime
    │
    ▼
  ┌──────────────┐    ┌──────────────┐
  │   Order      │───▶│ TaskTracker  │
  │ (orders)     │    │(pat_task_tr) │
  │ [NewBaseEnt] │    └──────────────┘
  └──────────────┘
         │
    ┌────┴────┐
    ▼         ▼
 ┌──────┐ ┌──────────┐
 │Mfg   │ │ Shipping │
 └──────┘ └──────────┘
```

---

## 3. Entity Catalog

### 3.1 Patient Domain

#### Patient — `patients` (383 lines) ⚠️
| Field | Type | Notes |
|-------|------|-------|
| firstName, lastName, middleName | String | |
| email | String | |
| mobileNo, countryCode | String | |
| dateOfBirth | Date | |
| gender | Gender (enum) | |
| uuid | String | unique index |
| chiefComplaint | String | |
| patientStatus | PatientStatus (enum) | |
| patientType | PatientType (enum) | |
| doctorId, addedByUserId | Long | |
| practiceLocationId, practiceDoctorId | String | |
| isTrackingAdded | boolean | |
| profilePictureUrl | String | |

**Relationships (⚠️ 7 EAGER — critical N+1 hotspot):**
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| addresses → Address | @OneToMany | LAZY | ALL, orphanRemoval |
| patientLogin → PatientLogin | @OneToMany | **EAGER** | ALL |
| invitations → PatientInvitation | @OneToMany | **EAGER** | ALL |
| treatments → Treatment | @OneToMany | **EAGER** | — |
| product → Product | @OneToMany | **EAGER** | ALL |
| user → User | @OneToOne | **EAGER** | ALL, orphanRemoval |
| doctorOrganization → PatientDoctorOrganization | @OneToOne | **EAGER** | ALL |

**⚠️ Business logic in entity:** `createPatient()` (4 overloads), `getDisplayName()`, `getFullAddress()`, `toPatientProfileDto()`

#### PatientLead — `patient_lead`
| Field | Type | Notes |
|-------|------|-------|
| firstName, lastName, email, mobileNo | String | |
| uuid | String | unique |
| status | LeadStatus (enum) | |
| doctorId | Long | |
| patientBelongsTo | String | |

**Relationships:** addresses → AddressLead (EAGER, CASCADE ALL)

#### PatientLogin — `patient_login`
| Relation | Fetch |
|----------|-------|
| patient → Patient | @ManyToOne |

#### PatientInvitation — `patient_invitation_deprecated`
| Relation | Fetch |
|----------|-------|
| patient → Patient | @ManyToOne |

#### PatientNotes — `patient_notes`
| Relation | Fetch |
|----------|-------|
| patient → Patient | LAZY |
| userProfile → UserProfile | LAZY |

#### ProfileImage — `profile_image`
| Field | Type | Notes |
|-------|------|-------|
| imageData | byte[] | @Lob |
| contentType, fileName | String | |

#### PatientKyc — `patient_kyc`
**Relationships:** patient → Patient (@ManyToOne)

---

### 3.2 Aligner Domain

#### AlignerJourney — `aligner_journey` (836 lines) 🔴 LARGEST ENTITY
| Field | Type | Notes |
|-------|------|-------|
| patientId | long | |
| brandName, modelName | String | |
| progressStatus | ProgressStatus (enum) | |
| journeyStatus | JourneyStatus (enum) | |
| creationStatus | AlignerCreationStatus (enum) | |
| totalAligners, currentAlignerNumber | int | |
| doctorTreatmentStartDate, treatmentEndDate | Date | |
| currentAlignerChangeDate, nextAlignerChangeDate | Date | |
| wearTimeDays | Integer | |
| treatmentPlanType | TreatmentPlanType (enum) | |

**Relationships (⚠️ 8 EAGER — worst N+1 hotspot):**
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| aligners → Aligner | @OneToMany | **EAGER** | ALL |
| customReminders → AlignerCustomReminder | @OneToMany | **EAGER** | ALL |
| defaultAlignerReminders → AlignerDefaultReminder | @OneToMany | **EAGER** | ALL |
| preAlignerPhotos → PreAlignerPhoto | @OneToMany | **EAGER** | ALL |
| alignerJourneyNotes → AlignerJourneyNote | @OneToMany | **EAGER** | ALL |
| alignerProductionOrders → AlignerProductionOrder | @OneToMany | **EAGER** | ALL |
| tracking → Tracking | @OneToOne | **EAGER** | — |
| patient → Patient | @ManyToOne | default | — |

**⚠️ Cascading EAGER:** Loading AlignerJourney also loads ALL its Aligners (each with 4 EAGER collections of their own), all production orders (each with EAGER productions+logs), all reminders, notes, photos.

**⚠️ Business logic (25+ methods):** `startJourney()`, `pauseJourney()`, `resumeJourney()`, `deactivateJourney()`, `changeAligner()`, `moveToPreviousAligner()`, `calculateTreatmentCompletion()`, `getExpectedEndDate()`, `isDelayed()`, `getCurrentDayOnAligner()`, etc.

#### Aligner — `aligners` (433 lines) ⚠️
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| alignerJourney → AlignerJourney | @ManyToOne | default | — |
| photos → AlignerPhoto | @OneToMany | **EAGER** | REMOVE |
| actions → AlignerAction | @OneToMany | **EAGER** | ALL |
| dailyWearTimeRecords → AlignerDailyWearTime | @OneToMany | **EAGER** | ALL |
| feedbacks → AlignerFeedback | @OneToMany | **EAGER** | REMOVE |
| alignerProduction → AlignerProduction | @OneToOne | default | ALL |

**⚠️ 4 EAGER collections** — nested inside AlignerJourney's EAGER list.

#### AlignerAction — `aligner_action` (250 lines)
| Field | Type | Notes |
|-------|------|-------|
| performedBy | Long | |
| type | AlignerActionType (enum) | |
| updateCategory | AlignerUpdateCategory (enum) | |
| validated | boolean | |
| details | AlignerActionDetails | JSONB |

**Business logic:** 6 static factory methods for different action types.

#### AlignerFeedback — `aligner_feedback` (180 lines)
| Field | Type | Notes |
|-------|------|-------|
| feedbackDetails | AlignerFeedbackDetails | JSONB |

#### AlignerProductionOrder — `aligner_production_order`
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| alignerProductions → AlignerProduction | @OneToMany | **EAGER** | ALL |
| logs → AlignerProductionLog | @OneToMany | **EAGER** | ALL |
| reminders → Reminder | @ManyToMany | **EAGER** | ALL |

#### AlignerProduction — `aligner_production`
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| logs → AlignerProductionLog | @OneToMany | **EAGER** | ALL |
| aligner → Aligner | @ManyToOne | **EAGER** | — |

Other aligner entities: `AlignerPhoto`, `PreAlignerPhoto`, `AlignerJourneyNote`, `AlignerDailyWearTime`, `AlignerCustomReminder`, `AlignerDefaultReminder`, `AlignerProductionLab`, `AlignerProductionLog`

---

### 3.3 Treatment Domain

#### Treatment — `treatment` (70 lines)
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| patient → Patient | @ManyToOne | default | — |
| payments → Payment | @OneToMany | **EAGER** | ALL |
| reminders → Reminder | @ManyToMany | **EAGER** | ALL |

#### TreatmentPlan — `treatment_plan` (414 lines) ⚠️
| Relation | Type | Fetch |
|----------|------|-------|
| patient → Patient | LAZY |
| files → File | **EAGER** (via join table) |
| treatmentPlanDTPs → TreatmentPlanDTP | **EAGER** |
| treatmentPlanProducts → TreatmentPlanProduct | **EAGER** |
| pdfFiles → File | **EAGER** (via join table) |
| otherFiles → File | **EAGER** (via join table) |
| linkedTreatmentPlan → TreatmentPlan | LAZY (self-ref) |

---

### 3.4 Braces Domain

#### BracesJourney — `braces_journey` (170 lines)
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| patient → Patient | default | — |
| appointments → Appointment | **EAGER** | ALL |
| reminders → Reminder | **EAGER** | ALL |
| bracesAppointmentPhotos → BracesAppointmentPhoto | **EAGER** | ALL |

---

### 3.5 User Domain

#### User — `users` (115 lines)
| Relation | Type | Fetch |
|----------|------|-------|
| patient → Patient | LAZY |
| userProfiles → UserProfile | LAZY (CASCADE ALL) |

#### UserProfile — `user_profile` (203 lines)
| Relation | Type | Fetch |
|----------|------|-------|
| user → User | LAZY (CASCADE ALL) |
| doctor → Doctor | LAZY |
| organization → Organization | LAZY |
| practiceLocations → PracticeLocation | LAZY (CASCADE ALL) |
| roles → Role | LAZY (via user_profile_role) |
| parent → UserProfile | LAZY (self-ref) |

**Business logic:** `isDoctor()`, `isAdmin()`, `isSuperAdmin()`, `isStaff()`, `isLabUser()`, etc.

#### Role — `roles`
| Relation | Type | Fetch |
|----------|------|-------|
| permissions → Permission | **EAGER** (CASCADE ALL) |

---

### 3.6 Order Domain

#### Order — `orders` (332 lines) — extends **NewBaseEntity** (String ID!)
| Relation | Type | Fetch |
|----------|------|-------|
| patient → Patient | default |
| treatmentPlans → TreatmentPlan | LAZY |
| parentOrder → Order | LAZY (self-ref) |
| orderProducts → OrderProduct | LAZY |

---

### 3.7 Workflow Domain

#### PatientTaskTracker — `patient_task_tracker` (545 lines) ⚠️
| Relation | Type | Fetch |
|----------|------|-------|
| workflowStatus → WorkflowStatus | LAZY |
| workflow → Workflow | LAZY |
| order → Order | LAZY |
| patient → Patient | LAZY |

**⚠️ 545 lines** with business logic in entity.

#### Workflow — `workflow` (78 lines)
| Relation | Type | Fetch |
|----------|------|-------|
| statuses → WorkflowStatus | LAZY |
| service → WorkflowService | LAZY |
| profile → UserProfile | LAZY |

---

### 3.8 Chat Domain

#### DoctorChat — `doctor_chat` (68 lines)
| Relation | Type | Fetch |
|----------|------|-------|
| patient → Patient | LAZY |
| messages → ChatMessage | orphanRemoval |
| participants → ChatParticipant | orphanRemoval |
| caseTeams → CaseTeam | LAZY (via join table) |

#### ChatMessage — `chat_message` (104 lines)
| Relation | Type | Fetch |
|----------|------|-------|
| chat → DoctorChat | LAZY |
| sender → ChatParticipant | LAZY |
| replyToMessage → ChatMessage | LAZY (self-ref) |
| files → File | LAZY (via join table) |

---

### 3.9 Storage Domain

#### File — `files` (353 lines) ⚠️
| Relation | Type | Fetch |
|----------|------|-------|
| sharedWith → FileSharedWith | **EAGER** (CASCADE ALL) |
| versions → FileVersion | **EAGER** (CASCADE ALL) |
| children → File | **EAGER** (self-ref folder hierarchy) |
| parentFile → File | default (self-ref) |

**Business logic:** `createFile()`, `createFolder()`, `createVersion()` static factories.

---

### 3.10 Invitation Domain

#### Invitation — `invitation` (95 lines)
| Relation | Type | Fetch | Cascade |
|----------|------|-------|---------|
| invitationStatuses → InvitationStatus | **EAGER** | ALL |
| customerInvites → CustomerInvite | **EAGER** | ALL |

---

### 3.11 VSP Domain (all extend NewBaseEntity)

#### VspOrder — `vsp_order`
| Relation | Type | Fetch |
|----------|------|-------|
| createdByProfile → UserProfile | LAZY |
| vspCaseRecords, vspPrescriptions, vspTreatmentPlans | @OneToMany | LAZY |
| vspShippingDetails → VspProductionShipping | @OneToMany | LAZY (CASCADE ALL) |

Other VSP entities: `VspCaseRecord`, `VspPrescription`, `VspTreatmentPlan`, `VspBillingDetails`, `VspShippingDetails`, `VspProduction`, `VspProductionShipping`

---

### 3.12 Other Entities

| Entity | Table | Key Notes |
|--------|-------|-----------|
| Appointment | `appointment` | EAGER file collections |
| CaseRecord | `case_record` | 3 EAGER file join tables |
| CaseInformation | `case_info` | LAZY patient ref, JSONB |
| Timeline | `timeline` | 40+ event types |
| Reminder | `reminder` (462 lines ⚠️) | 20+ business methods |
| Payment | `payment` | |
| Subscription | `subscription` | JSONB features |
| Tracking | `tracking` | EAGER treatmentPlan |
| Blog | `blog` | |
| Prescription | `prescription` | |
| DashboardLabels | `dashboard_labels` | |
| DoctorBilling | `doctor_billing` | |
| Flag | `flag` | Feature flags |
| GettingStarted | `getting_started` | |
| SmartBox | `smart_box` | |
| ConsentTemplate | `consent_template` | |
| ConsentAcceptedRecord | `consent_accepted_record` | |
| DoctorInvitation | `doctor_invitation` | |
| DoctorInvitationCode | `doctor_invitation_code` | |

---

## 4. EAGER Loading Analysis

### 🔴 Critical EAGER Cascades

Loading **one Patient** entity triggers:
```
Patient
├── patientLogin (EAGER)
├── invitations (EAGER)
├── treatments (EAGER)
│   └── payments (EAGER)
│   └── reminders (EAGER)
├── product (EAGER)
├── user (EAGER)
│   └── userProfiles → roles → permissions (EAGER chain)
└── doctorOrganization (EAGER)
```
**Estimated queries:** 7-15+ per Patient load

Loading **one AlignerJourney** entity triggers:
```
AlignerJourney
├── aligners (EAGER) → for EACH Aligner:
│   ├── photos (EAGER)
│   ├── actions (EAGER)
│   ├── dailyWearTimeRecords (EAGER)
│   └── feedbacks (EAGER)
├── customReminders (EAGER)
├── defaultAlignerReminders (EAGER)
├── preAlignerPhotos (EAGER)
├── alignerJourneyNotes (EAGER)
├── alignerProductionOrders (EAGER) → for EACH:
│   ├── alignerProductions (EAGER) → logs (EAGER)
│   ├── logs (EAGER)
│   └── reminders (EAGER)
└── tracking (EAGER) → treatmentPlan (EAGER)
```
**Estimated queries:** 20-50+ per AlignerJourney load (depends on aligner count)

### Complete EAGER Relationship Registry

| Entity | EAGER Relations | Count |
|--------|----------------|-------|
| **AlignerJourney** | aligners, customReminders, defaultReminders, prePhotos, notes, productionOrders, tracking | **8** |
| **Patient** | patientLogin, invitations, treatments, product, user, doctorOrganization | **7** (addresses LAZY) |
| **Aligner** | photos, actions, dailyWearTime, feedbacks | **4** |
| **TreatmentPlan** | files, DTPs, products, pdfFiles, otherFiles | **5** |
| **AlignerProductionOrder** | productions, logs, reminders | **3** |
| **BracesJourney** | appointments, reminders, photos | **3** |
| **CaseRecord** | preTreatmentFiles, scanFiles, xRayFiles | **3** |
| **Appointment** | files, draftFiles, appointmentReminders | **3** |
| **File** | sharedWith, versions, children | **3** |
| **Treatment** | payments, reminders | **2** |
| **Invitation** | statuses, customerInvites | **2** |
| **AlignerProduction** | logs, aligner | **2** |
| **PatientLead** | addresses | **1** |
| **Role** | permissions | **1** |
| **Tracking** | treatmentPlan | **1** |

**Total EAGER relationships:** ~48 across all entities

---

## 5. JSONB Columns (Hypersistence JsonType)

| Entity | JSONB Field | Java Type |
|--------|-------------|-----------|
| AlignerAction | details | AlignerActionDetails |
| AlignerFeedback | feedbackDetails | AlignerFeedbackDetails |
| TreatmentPlan | alignerDetailsMetadata | String |
| TreatmentPlan | treatmentPlanMetadata | String |
| TreatmentPlan | stlFileMetadata | String |
| CaseInformation | toothSelection | Object |
| PatientTaskTracker | labels | List |
| Subscription | features | Object |
| Timeline | eventData | Object |
| Reminder | reminderData | Object |

---

## 6. Enums Summary (145 total)

### Patient Enums
| Enum | Values |
|------|--------|
| Gender | MALE, FEMALE, NON_BINARY, OTHER |
| PatientStatus | ACTIVE, PAUSED, DEACTIVATED, COMPLETED |
| PatientType | JUST_EXPLORING, NOT_STARTED, IN_TREATMENT |
| InviteStatus | REGISTERED, NOT_REGISTERED, NOT_INVITED |

### Aligner Enums
| Enum | Values |
|------|--------|
| ProgressStatus | IN_PROGRESS, COMPLETED, PAUSED, DEACTIVATED |
| JourneyStatus | ACTIVE, PAUSED, COMPLETED, DEACTIVATED |
| AlignerCreationStatus | DRAFT, ACTIVE, COMPLETED |
| AlignerActionType | CHECK_IN, ALIGNER_CHANGE, FEEDBACK, ISSUE_REPORT |
| TreatmentStage | UPPER, LOWER, BOTH |
| TreatmentPlanType | NEW, REFINEMENT, RETAINER |
| ProductionStatus | PENDING, IN_PROGRESS, COMPLETED, SHIPPED |
| AlignerUpdateCategory | EARLY, ON_TIME, DELAYED |

### Treatment Enums
| Enum | Values |
|------|--------|
| TreatmentStatus | DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED |
| TreatmentType | ALIGNER, BRACES |

### Order Enums
| Enum | Values |
|------|--------|
| OrderStatus | NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| OrderType | NEW_ORDER, RE_PLAN, REFINEMENT, RETAINER, ADDITIONAL, VSP |

### User Enums
| Enum | Values |
|------|--------|
| UserType | DOCTOR, PATIENT, STAFF, ADMIN, SUPER_ADMIN |
| RoleName | DOCTOR, PATIENT, STAFF, ADMIN, SUPER_ADMIN, LAB_USER |

*(Full enum catalog: 145 enums across all feature modules)*

---

## 7. JPA Projections (59 total)

Key projections by domain:

### Aligner Projections
| Projection | Used For |
|-----------|----------|
| AlignerJourneyProjection | Dashboard listing with compliance metrics |
| AlignerAnalyticsChartProjection | Chart data (needsAttention, atRisk, onTrack counts) |
| AlignerJourneyDetailsProjection | Detailed patient aligner info for analytics |
| AlignerActionCountProjection | Action count aggregations |

### Patient Projections
| Projection | Used For |
|-----------|----------|
| PatientListProjection | Main patient list with 20+ fields |
| PatientActiveProjection | Active patient summaries |

### Workflow Projections
| Projection | Used For |
|-----------|----------|
| PatientTaskTrackerProjection | Kanban task cards (70+ fields!) |
| KanbanViewProjection | Kanban board summaries |

### Order Projections
| Projection | Used For |
|-----------|----------|
| OrderDetailsProjection | Full order details |
| OrderBatchProjection | Batch manufacturing summaries |

---

## 8. Repository Query Patterns

### Largest Repositories

| Repository | Lines | Native Queries | JPQL Queries | Complexity |
|-----------|-------|---------------|-------------|------------|
| AlignerJourneyRepository | ~1,100 | 14+ | 6+ | 🔴 EXTREME |
| PatientRepository | ~300 | 3 | 6+ | 🟡 HIGH |
| InvitationRepository | ~250 | 2 | 7+ | 🟡 HIGH |
| BracesJourneyRepository | ~90 | 1 | 5+ | 🟢 MEDIUM |

### Notable Query Complexity

**AlignerJourneyRepository** — Most complex repository:
- `getAlignerJourneyDetailsForAnalytics`: **~150 lines** native SQL with **7 CTEs** (patient selection → invitation status → practice info → aligner journeys → actions → compliance → validation)
- `getAlignerAnalyticsChartCountForDoctor`: 3-level CTE for compliance classification using `DISTINCT ON`, `AGE()`, date arithmetic
- `getPatientDueStatusDetailsForDoctor`: `CASE WHEN` with date arithmetic for early/onTime/delayed

### N+1 Risk Areas

| Pattern | Location | Risk |
|---------|----------|------|
| EAGER Patient load in loop | DoctorDashboard queries | 🔴 High |
| EAGER AlignerJourney in loop | Analytics, list endpoints | 🔴 High |
| EAGER Aligner nested in Journey | Any journey fetch | 🔴 High |
| JOIN FETCH without pagination | PatientRepository.findFullPatient | 🟡 Medium |
| Projection with nested queries | AlignerJourneyDetailsProjection | 🟡 Medium |

---

## 9. Missing Infrastructure

| What's Missing | Impact | Priority |
|---------------|--------|----------|
| **Flyway/Liquibase migrations** | Schema changes uncontrolled in prod | 🔴 Critical |
| **Database indexes audit** | Only partial indexing on entities | 🟡 High |
| **Read replicas** | All reads hit primary DB | 🟡 Medium |
| **Connection pool monitoring** | HikariCP not monitored | 🟡 Medium |
| **Query performance logging** | No slow query detection | 🟡 Medium |

---

*See also:*
- [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)
- [Dependency & Integration Map](./04-DEPENDENCY-INTEGRATION-MAP.md)
- [Technical Debt Register](./05-TECHNICAL-DEBT-REGISTER.md)
