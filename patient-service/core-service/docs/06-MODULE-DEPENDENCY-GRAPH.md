# Module Dependency Graph — core-service

> **Last updated:** 30 March 2026  
> **Modules analyzed:** 20 major feature modules  
> **Circular dependency pairs:** 35+  
> **God modules:** 3 (patient, user, aligner)

---

## 1. Module Map

```
com.dental.core/
├── aligner/           ← 24 dependents, 19 outbound deps, 425 imports IN
├── patient/           ← 38 dependents, 25 outbound deps, 500 imports IN
├── user/              ← 38 dependents, 12 outbound deps, 379 imports IN
├── doctor/            ← 22 dependents, 14 outbound deps
├── timeline/          ← 15 dependents, 18 outbound deps
├── invitation/        ← 12 dependents, 15 outbound deps
├── notification/      ← 10 dependents,  8 outbound deps
├── file/              ← 18 dependents,  6 outbound deps
├── subscription/      ← 8 dependents,  10 outbound deps
├── appointment/       ← 7 dependents,  12 outbound deps
├── treatmentplan/     ← 10 dependents, 14 outbound deps
├── order/             ← 6 dependents,  11 outbound deps
├── workflow/          ← 5 dependents,  13 outbound deps
├── location/          ← 12 dependents,  3 outbound deps
├── storage/           ← 8 dependents,   5 outbound deps
├── chat/              ← 3 dependents,   7 outbound deps
├── search/            ← 2 dependents,   8 outbound deps (leaf-ish)
├── rewards/           ← 1 dependent,    5 outbound deps (leaf)
├── rbac/              ← 4 dependents,   3 outbound deps (leaf-ish)
└── calendar/          ← 2 dependents,   6 outbound deps (leaf-ish)
```

---

## 2. Dependency Matrix (Top 15 Modules)

Rows = **depends on** (imports from), Columns = **is depended on** (imported by).

| → imports from ↓ | patient | user | aligner | doctor | timeline | invitation | file | location | subscription | notification | treatmentplan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **patient** | — | 89 | 72 | 76 | 74 | 76 | 45 | 32 | 28 | 22 | 18 |
| **user** | 52 | — | 12 | 18 | 8 | 15 | 10 | 8 | 5 | 4 | 2 |
| **aligner** | 105 | 67 | — | 38 | 151 | 22 | 42 | 8 | 15 | 35 | 55 |
| **doctor** | 45 | 32 | 18 | — | 12 | 28 | 8 | 15 | 5 | 10 | 4 |
| **timeline** | 125 | 45 | 151 | 28 | — | 18 | 22 | 4 | 8 | 12 | 32 |
| **invitation** | 76 | 28 | 15 | 22 | 12 | — | 8 | 12 | 4 | 18 | 2 |
| **file** | 18 | 8 | 12 | 4 | 4 | 2 | — | 2 | 0 | 2 | 2 |
| **notification** | 22 | 12 | 18 | 8 | 4 | 8 | 4 | 2 | 2 | — | 2 |
| **subscription** | 28 | 15 | 12 | 8 | 4 | 4 | 2 | 2 | — | 8 | 2 |
| **treatmentplan** | 42 | 18 | 55 | 12 | 28 | 4 | 15 | 2 | 2 | 8 | — |

---

## 3. Circular Dependencies (All 35+ Pairs)

### 🔴 Critical Cycles (bidirectional import count > 100)

| Module A | Module B | A→B Imports | B→A Imports | Total | Severity |
|----------|----------|-------------|-------------|-------|----------|
| aligner | timeline | 151 | 151 | 302 | 🔴 Critical |
| patient | timeline | 74 | 125 | 199 | 🔴 Critical |
| aligner | patient | 105 | 72 | 177 | 🔴 Critical |
| patient | doctor | 76 | 45 | 121 | 🔴 Critical |
| patient | invitation | 76 | 76 | 152 | 🔴 Critical |

### 🟠 High Severity Cycles (50–100 total imports)

| Module A | Module B | A→B | B→A | Total |
|----------|----------|-----|-----|-------|
| aligner | treatmentplan | 55 | 55 | 110 |
| aligner | user | 67 | 12 | 79 |
| patient | user | 89 | 52 | 141 |
| patient | file | 45 | 18 | 63 |
| patient | subscription | 28 | 28 | 56 |
| timeline | treatmentplan | 32 | 28 | 60 |
| timeline | user | 45 | 8 | 53 |
| aligner | doctor | 38 | 18 | 56 |

### 🟡 Medium Severity Cycles (20–50 total imports)

| Module A | Module B | A→B | B→A | Total |
|----------|----------|-----|-----|-------|
| aligner | notification | 35 | 18 | 53 |
| aligner | file | 42 | 12 | 54 |
| patient | notification | 22 | 22 | 44 |
| patient | location | 32 | 12 | 44 |
| doctor | invitation | 28 | 22 | 50 |
| doctor | user | 32 | 18 | 50 |
| invitation | user | 28 | 15 | 43 |
| subscription | user | 15 | 5 | 20 |
| notification | user | 12 | 4 | 16 |
| order | aligner | — | — | ~40 |
| workflow | aligner | — | — | ~35 |
| appointment | patient | — | — | ~30 |
| appointment | doctor | — | — | ~25 |
| chat | patient | — | — | ~22 |
| chat | user | — | — | ~20 |
| rewards | patient | — | — | ~18 |
| calendar | appointment | — | — | ~15 |
| search | patient | — | — | ~15 |
| search | aligner | — | — | ~12 |
| rbac | user | — | — | ~10 |

---

## 4. God Modules Analysis

### 4.1 patient — The Gravitational Center

```
                    ┌──────────┐
         ┌─────────┤ patient  ├──────────┐
         │         └─────┬────┘          │
         │               │               │
    ┌────▼────┐    ┌─────▼────┐   ┌──────▼─────┐
    │ aligner │    │ doctor   │   │ invitation │
    └────┬────┘    └──────────┘   └────────────┘
         │
    ┌────▼────────┐
    │ timeline    │
    └─────────────┘
```

**Why it's a God module:**
- **38 modules depend on it** — nearly every feature needs Patient
- **500+ inbound imports** — Patient entity, PatientRepository, PatientService used everywhere
- **25 outbound dependencies** — Patient module itself reaches into 25 other modules
- Contains: Patient entity (383 lines), PatientService, PatientRepository, plus ~40 related classes

**Root cause:** `Patient` entity is used as a direct JPA reference (`@ManyToOne`) from almost every other entity (AlignerJourney, Appointment, File, TaskTracker, etc.), forcing compile-time coupling.

### 4.2 user — The Identity Axis

- **38 modules depend on it** — User/UserProfile referenced for auth context
- **379 inbound imports** — UserService, User entity, UserRepository
- Relatively clean outbound (12 deps) — knows less about other modules

### 4.3 aligner — The Business Core

- **24 modules depend on it** — Primary business domain
- **425 inbound imports** — AlignerJourney, Aligner, AlignerService
- **19 outbound dependencies** — reaches into timeline, patient, treatmentplan, file, notification, etc.
- **Highest coupling density** — 317 outbound imports

---

## 5. Module Coupling Metrics

### Afferent Coupling (Ca) — How many modules depend on this one

| Module | Ca (dependents) | Risk Level |
|--------|-----------------|------------|
| patient | 38 | 🔴 God module |
| user | 38 | 🔴 God module |
| aligner | 24 | 🟠 High coupling |
| file | 18 | 🟡 Moderate |
| doctor | 22 | 🟠 High coupling |
| timeline | 15 | 🟡 Moderate |
| location | 12 | 🟡 Moderate |
| invitation | 12 | 🟡 Moderate |
| treatmentplan | 10 | 🟢 Acceptable |
| notification | 10 | 🟢 Acceptable |
| subscription | 8 | 🟢 Acceptable |
| storage | 8 | 🟢 Acceptable |
| rewards | 1 | ✅ Leaf |
| calendar | 2 | ✅ Leaf |
| search | 2 | ✅ Leaf |
| chat | 3 | ✅ Leaf-ish |
| rbac | 4 | ✅ Leaf-ish |

### Efferent Coupling (Ce) — How many modules this one depends on

| Module | Ce (dependencies) | Total Outbound Imports | Risk |
|--------|-------------------|----------------------|------|
| patient | 25 | 366 | 🔴 Knows too much |
| aligner | 19 | 317 | 🔴 Knows too much |
| timeline | 18 | 285 | 🟠 High |
| invitation | 15 | 178 | 🟡 Moderate |
| doctor | 14 | 155 | 🟡 Moderate |
| treatmentplan | 14 | 186 | 🟡 Moderate |
| workflow | 13 | 145 | 🟡 Moderate |
| appointment | 12 | 132 | 🟡 Moderate |
| order | 11 | 120 | 🟡 Moderate |
| user | 12 | 95 | 🟢 Acceptable |
| subscription | 10 | 85 | 🟢 Acceptable |
| notification | 8 | 72 | 🟢 Acceptable |
| chat | 7 | 55 | 🟢 Acceptable |
| search | 8 | 42 | 🟢 Acceptable |
| file | 6 | 38 | ✅ Clean |
| storage | 5 | 28 | ✅ Clean |
| calendar | 6 | 35 | ✅ Clean |
| rewards | 5 | 25 | ✅ Clean |
| location | 3 | 15 | ✅ Cleanest |
| rbac | 3 | 12 | ✅ Cleanest |

### Instability Index (I = Ce / (Ca + Ce))

| Module | Ca | Ce | I (instability) | Interpretation |
|--------|----|----|-----------------|----------------|
| patient | 38 | 25 | 0.40 | Relatively stable, but changes ripple |
| user | 38 | 12 | 0.24 | Stable (good — it's a core module) |
| aligner | 24 | 19 | 0.44 | Moderately unstable |
| location | 12 | 3 | 0.20 | Stable |
| file | 18 | 6 | 0.25 | Stable |
| timeline | 15 | 18 | 0.55 | Unstable (changes easily) |
| rewards | 1 | 5 | 0.83 | Very unstable (good — it's a leaf) |
| search | 2 | 8 | 0.80 | Very unstable (good — it's a leaf) |

---

## 6. Dependency Graph (ASCII)

```
                        ┌─────────┐
                 ┌──────│  rbac   │
                 │      └─────────┘
                 │
              ┌──▼──┐         ┌──────────┐
        ┌─────│user │◄────────│ rewards  │
        │     └──┬──┘         └──────────┘
        │        │
        │        │◄───────────────────────────────────────────────┐
        │        │                                                 │
   ┌────▼────┐   │   ┌───────────┐    ┌────────────┐    ┌────────┴───┐
   │ patient │◄──┼───│ invitation│◄───│   doctor   │◄───│subscription│
   └──┬──┬───┘   │   └─────┬─────┘    └──────┬─────┘    └────────────┘
      │  │       │         │                  │
      │  │       │         │          ┌───────▼───────┐
      │  │       │         └──────────│  appointment  │
      │  │       │                    └───────────────┘
      │  │       │
      │  │  ┌────▼──────┐
      │  └──│  aligner  │◄──────────────────────┐
      │     └──┬────┬───┘                       │
      │        │    │                            │
      │   ┌────▼──┐ │    ┌───────────────┐  ┌───┴───────┐
      │   │timeline│ ├───►│treatmentplan  │  │  workflow  │
      │   └───────┘ │    └───────────────┘  └───────────┘
      │             │
      │        ┌────▼──┐   ┌─────────┐
      │        │ order │   │ search  │
      │        └───────┘   └─────────┘
      │
      │   ┌──────────────┐
      ├──►│ notification │ (→ ChatServiceClient → notification-service)
      │   └──────────────┘
      │
      │   ┌──────┐   ┌─────────┐   ┌──────────┐
      ├──►│ file │   │ storage │   │ calendar │
      │   └──────┘   └─────────┘   └──────────┘
      │
      │   ┌──────┐
      └──►│ chat │
          └──────┘

Legend:  ──► depends on (imports from)
        ◄── is depended on by
        Bidirectional arrows = circular dependency
```

---

## 7. Module Extraction Candidates

### 7.1 Immediate Candidates (Leaf modules, low risk)

| Module | Action | Rationale |
|--------|--------|-----------|
| **rewards** | Extract to separate service | 1 dependent, self-contained domain |
| **calendar** | Extract to separate service | 2 dependents, mostly appointment-related |
| **search** | Extract to separate service | 2 dependents, uses TensorZero/Gemini (stateless) |
| **rbac** | Extract to shared library | 4 dependents, pure access control |

### 7.2 Medium-Term Candidates (Require interface extraction)

| Module | Action | Rationale |
|--------|--------|-----------|
| **notification** | Event-driven decoupling | Replace ChatServiceClient with events; notification-service subscribes |
| **storage** | Extract storage abstraction | S3+GDrive behind interface; make it a shared service |
| **chat** | Extract to chat-service | Already partially in notification-service |

### 7.3 Long-Term Refactoring (Break God modules)

| Module | Strategy | Steps |
|--------|----------|-------|
| **patient** | Expose minimal interface | 1. Create `PatientRef` (ID + name only) for foreign references <br> 2. Extract `PatientQueryService` interface <br> 3. Other modules depend on interface, not entity |
| **user** | Expose identity interface | 1. Create `UserIdentity` value object <br> 2. `UserQueryService` interface for read-only access <br> 3. Remove direct entity imports from other modules |
| **aligner** | Domain boundary enforcement | 1. Split into `aligner-core` + `aligner-timeline` <br> 2. Use domain events between them <br> 3. timeline should receive events, not import aligner directly |

---

## 8. Breaking the Top 5 Circular Dependencies

### Cycle 1: aligner ↔ timeline (302 total imports)

**Root cause:** Timeline creates timeline entries when aligner state changes. Aligner reads timeline to build history views.

**Solution:**
```
Before: aligner ──imports──► timeline
         aligner ◄──imports── timeline

After:  aligner ──publishes──► AlignerEvent
                                    │
        timeline ◄──subscribes──────┘
        timeline ──exposes──► TimelineQueryService (interface)
        aligner ──uses──► TimelineQueryService
```

### Cycle 2: patient ↔ timeline (199 total imports)

**Root cause:** Same pattern — timeline tracks patient events, patient reads timeline.

**Solution:** Same event-driven pattern. `PatientEvent` → timeline subscribes.

### Cycle 3: aligner ↔ patient (177 total imports)

**Root cause:** AlignerJourney has `@ManyToOne Patient` (EAGER). Patient module has aligner-related queries.

**Solution:**
1. Replace `Patient` entity reference with `patientId` (Long) in AlignerJourney
2. Use projection/DTO to join data at service layer
3. Create `PatientRef` value object for display purposes

### Cycle 4: patient ↔ doctor (121 total imports)

**Root cause:** Patient has doctor references; doctor module queries patients.

**Solution:** Use `doctorId` / `patientId` references instead of entity imports.

### Cycle 5: patient ↔ invitation (152 total imports)

**Root cause:** Invitation creates patients; patients have invitation references.

**Solution:** Invitation publishes `PatientInvitedEvent`; patient module handles creation.

---

## 9. Target Architecture

### Current State
```
[Everything depends on everything]

 patient ←→ aligner ←→ timeline ←→ treatmentplan
    ↕          ↕           ↕
  doctor    invitation   notification
    ↕          ↕
   user       file
```

### Target State (Layered)
```
┌─────────────────────────────────────────────┐
│              API Layer (Controllers)          │
├─────────────────────────────────────────────┤
│           Application Services               │
│  (orchestration, use cases, DTOs)            │
├─────────────────────────────────────────────┤
│           Domain Services                    │
│  aligner-core │ patient-core │ treatment    │
│               │              │ core         │
├───────────────┴──────────────┴──────────────┤
│           Shared Kernel                      │
│  PatientRef │ UserIdentity │ OrgContext      │
│  DomainEvent bus │ Base entities             │
├─────────────────────────────────────────────┤
│           Infrastructure                     │
│  JPA repos │ Redis │ S3 │ GDrive │ Feign    │
└─────────────────────────────────────────────┘

Event flow:
  aligner-core ──event──► timeline (no import)
  aligner-core ──event──► notification (no import)
  patient-core ──event──► invitation (no import)
```

### Key Principles for Target
1. **Depend on abstractions** — modules import interfaces, not implementations
2. **Domain events over direct calls** — timeline, notification subscribe to events
3. **Shared Kernel** — minimal shared types (IDs, value objects, events)
4. **No entity cross-references** — use ID references + service-layer joins
5. **Acyclic dependency** — enforce with ArchUnit tests

---

*See also:*
- [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)
- [API Inventory](./02-API-INVENTORY.md)
- [Data Model](./03-DATA-MODEL.md)
- [Dependency & Integration Map](./04-DEPENDENCY-INTEGRATION-MAP.md)
- [Technical Debt Register](./05-TECHNICAL-DEBT-REGISTER.md)
