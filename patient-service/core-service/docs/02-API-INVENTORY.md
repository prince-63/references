# API Inventory — core-service

> **Last updated:** 30 March 2026  
> **Total controllers:** 118 (108 with active endpoints, 10 fully commented out)  
> **Total active REST endpoints:** ~470+  
> **Deprecated endpoints:** 4  
> **WebSocket controller:** 1

---

## Summary

| API Version | Controller Count | Notes |
|-------------|-----------------|-------|
| v1 | ~90% | Majority of endpoints |
| v2 | 5 | Patient, Profile, AlignerAction, ServiceProduct, TreatmentPlan |
| v5 | 1 | Dashboard (sampledata) |
| No version | ~15 | Flag, Prescription, Manufacturing, workflow sub-modules |

### Controllers with ALL endpoints commented out (dead code)

| Controller | Module | Notes |
|-----------|--------|-------|
| AlignerWearTimeController | aligner | Wear time tracking disabled |
| BracesDashboardController | braces | Dashboard disabled |
| FAQController | faq | Entire feature disabled |
| FeedbackController | feedback | Entire feature disabled |
| ProductTypeController | producttype | Product types disabled |
| SampleDataController | sampledata | Sample data gen disabled |
| TreatmentPlanController (v2) | treatment | V2 treatment plans disabled |

---

## Endpoints by Feature Module

### aligner

#### AlignerController (v1) — `/api/v1/aligner`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | updateAlignerJourney | Updates an aligner journey |
| POST | `/start-date` | updateAlignerJourneyStartDate | Updates journey start date |
| POST | `/start` | startAlignerJourney | Starts a journey |
| GET | `/{patient_id}` | getAlignerJourney | Gets journey for patient |
| POST | `/change` (multipart) | changeAligner | Changes aligner with files |
| POST | `/change/aligner/previous` | moveToPreviousAligner | Moves to previous aligner |
| POST | `/discard/{id}` | discardAlignerJourney | Discards a journey |
| POST | `/{patient_id}/wearing/duration` | setDailyWearTime | Sets daily wear time |
| GET | `/wear-time/logs` | getDailyWearTimeLogs | Gets wear time logs |
| GET | `/aligner-wise/stats` | getAlignerWiseStats | Gets aligner-wise stats |
| GET | `/date-wise/stats` | getDateWiseStats | Gets date-wise stats |
| GET | `/stats` | getAlignerStats | Gets overall journey stats |
| GET | `/consistency-alert` | getConsistencyAlertDetails | Gets consistency alerts |
| POST | `/update-wear-days` | updateWearDays | Updates wear days |
| POST | `/update` | updateAligner | Updates aligner details |
| POST | `/filter` | getPatientAccordingToAlignerFilter | Filters patients by aligner |

#### AlignerActionController (v1) — `/api/v1/aligner/action`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/all/{journey_id}` | getAlignerActions | Gets all actions for journey |
| GET | `/{action_id}` | getAlignerActionDetails | Gets action details |
| POST | `/issue` | reportAlignerIssue | Reports an issue |
| POST | `/` (multipart) | checkIn | Check-in with files |
| POST | `/change` | changeAligner | Changes aligner |
| POST | `/validate` | validateAlignerChange | Validates change request |
| POST | `/comment` | commentOnAction | Comments on action |
| GET | `/patient-details` | getPatientActionDetails | Gets patient action summary |
| POST | `/categorized` | getAlignerActionDetails | Gets categorized actions |
| POST | `/actions/inactivate` | inactivateActions | Inactivates actions |

#### AlignerActionV2Controller (v2) — `/api/v2/aligner/action`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | checkIn | V2 check-in with photos |
| GET | `/photos/{patient_id}` | getPhotosByPatient | Gets check-in photos |

#### AlignerAnalyticsController (v1) — `/api/v1/aligner/analytics`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/chart` | getChartCountData | Gets analytics chart data |
| POST | `/` | getPatientsAnalyticsDetails | Gets patient analytics |
| POST | `/for-remind-all` | getPatientForRemindAll | Gets patients for remind-all |

#### AlignerCronController (v1) — `/api/v1/aligner/cron`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/daily` | triggerNotifications | Triggers daily notifications |

#### AlignerNoteController (v1) — `/api/v1/aligner/note`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | addNote | Adds journey note |
| POST | `/update` | updateNote | Updates journey note |
| POST | `/delete` | deleteNote | Deletes journey note |

#### AlignerReminderController (v1) — `/api/v1/aligner/reminder`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/custom` | setCustomReminder | Sets custom reminder |
| POST | `/default` | setDefaultReminder | Sets default reminder |
| PATCH | `/custom` | updateCustomReminder | Updates custom reminder |
| PATCH | `/default` | updateDefaultReminder | Updates default reminder |
| DELETE | `/custom` | deleteCustomReminder | Deletes custom reminder |
| DELETE | `/default` | deleteDefaultReminder | Deletes default reminder |
| POST | `/schedule/missed/job` | rescheduleMissingJobs | Reschedules missing jobs |

#### AlignerProductionController (v1) — `/api/v1/aligner/production`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | updateAlignerProduction | Updates production details |
| GET | `/logs` | getProductionOrderUpdateLogs | Gets production logs |

#### AlignerProductionLabController (v1) — `/api/v1/aligner/production/lab`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getAlignerProductionLab | Gets all labs |
| POST | `/` | addAlignerProductionLab | Adds new lab |

#### AlignerProductionReminderController (v1) — `/api/v1/aligner/production/reminder`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | addReminder | Adds production reminder |
| POST | `/delete` | deleteReminder | Deletes production reminder |
| POST | `/update` | updateReminder | Updates production reminder |

#### UnprocessedAlignerController (v1) — `/api/v1/aligner/unprocessed`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | getUnprocessedAlignerList | Gets unprocessed aligners |

---

### app_dentals

#### AppDetailsController (v1) — `/api/v1/app`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getAllAppDetails | Gets all app details |
| PUT | `/` | updateAppDetailsByAppName | Updates app by name |
| POST | `/` | createApp | Creates app entry |

---

### appointment

#### AppointmentController (v1) — `/api/v1/appointment`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | createAppointment | Creates appointment with files |
| POST | `/update` | updateAppointment | Updates appointment |
| GET | `/{id}` | getAppointment | Gets appointment by ID |
| GET | `/` | getAppointment | Gets with query params |
| POST | `/files` (multipart) | addFiles | Adds files to appointment |
| DELETE | `/{id}` | deleteAppointmentById | Deletes appointment |

#### AppointmentReminderController (v1) — `/api/v1/appointment/reminder`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | addAppointmentReminder | Adds reminder |
| POST | `/delete` | deleteAppointmentReminder | Deletes reminder |
| GET | `/` | getAppointmentReminder | Gets reminders |

#### CustomAppointmentReminderController (v1) — `/api/v1/custom/reminder`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | setCustomAppointmentReminder | Sets custom reminder |
| POST | `/update` | updatePaymentReminder | Updates reminder |
| POST | `/delete` | deletePaymentReminder | Deletes reminder |
| GET | `/appointments` | getAppointmentReminders | Gets reminders list |
| GET | `/appointments/patients` | getRemindersForPatients | Gets reminders for patients |

---

### blog

#### BlogController (v1) — `/api/v1/blog`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | addBlog | Creates blog with image |
| GET | `/` | getBlogs | Gets all blogs |

---

### braces

#### BracesJourneyController (v1) — `/api/v1/braces`
| Method | Path | Handler | Description | Deprecated |
|--------|------|---------|-------------|------------|
| POST | `/` | createBracesJourney | Creates braces journey | No |
| POST | `/update` | updateAlignerJourney | Updates braces journey | No |
| GET | `/` | getBracesJourneysForWeb | Gets journeys for web | **Yes** ⚠️ |
| POST | `/filter` | getFilteredBracesJourneys | Gets filtered journeys | No |

---

### bracket

#### BracketController (v1) — `/api/v1/bracket`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/add` | addBracketCompanyName | Adds bracket company |
| GET | `/` | getAllBrackets | Gets all brackets |
| GET | `/type/{id}` | getBracketType | Gets bracket types |
| GET | `/subtype/{id}` | getBracketSubType | Gets sub-types |
| GET | `/company/{id}` | getBracketCompany | Gets companies |

---

### bulkupload

#### BulkUploadController (v1) — `/api/v1/bulk`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/import/treatment-plan` | importTreatmentPlan | Bulk imports treatment plans |

---

### cache

#### CacheController (v1) — `/api/v1/cache`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/{profile_id}` | clearDashboardCache | Clears dashboard cache |

---

### calendar

#### CalendarController (v1) — `/api/v1/calendar`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/reminders` | getCalendarReminders | Gets calendar reminders |

---

### caseinfo

#### AnchorTypeController (v1) — `/api/v1/case`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/anchor` | getAnchorTypeForDoctor | Gets anchor types |
| POST | `/anchor` | addAnchorType | Adds anchor type |

#### CaseInformationController (v1) — `/api/v1/case/info`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | addCaseInfo | Adds case info with files |
| GET | `/` | getCaseInformation | Gets case information |

---

### caserecord

#### CaseRecordController (v1) — `/api/v1/caserecord`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | createCaseRecord | Creates with files |
| POST | `/patient` | getCaseRecordByPatientId | Gets by patient ID |
| GET | `/all/{patient_id}` | getAllCaseRecords | Gets all for patient |
| GET | `/{id}` | getCaseRecordById | Gets by ID |
| DELETE | `/{id}` | deleteCaseRecord | Deletes record |

---

### chat

#### AlignerCheckInController (v1) — `/api/v1/chat/checkin`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | createCheckIn | Creates check-in with photos |
| GET | `/{id}` | getCheckInById | Gets check-in by ID |
| GET | `/patient/{id}` | getCheckInsByPatient | Gets paginated check-ins |
| GET | `/patient/{id}/latest` | getLatestCheckIn | Gets latest check-in |
| GET | `/patient/{id}/max-aligner` | getMaxAlignerNumber | Gets max aligner number |

#### CaseTeamController (v1) — `/api/v1/chat/teams`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createTeam | Creates case team |
| GET | `/{id}` | getTeamById | Gets team by ID |
| GET | `/` | getMyTeams | Gets own teams |
| GET | `/membership` | getTeamsImIn | Gets joined teams |
| POST | `/{id}/members` | addMembers | Adds members |
| DELETE | `/{id}/members` | removeMembers | Removes members |
| PUT | `/{id}` | updateTeam | Updates team |
| DELETE | `/{id}` | deleteTeam | Deletes team |

#### ChatMessageController (v1) — `/api/v1/chat/messages`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | sendMessage | Sends message with attachments |
| GET | `/{id}` | getMessage | Gets message by ID |
| POST | `/by-chat` | getMessagesByChat | Gets messages by chat |
| POST | `/vsp/by-chat` | getVspMessagesByChat | Gets VSP messages |
| GET | `/before` | getMessagesBeforeTimestamp | Gets messages before time |
| DELETE | `/{id}` | deleteMessage | Deletes message |
| PUT | `/{id}` | editMessage | Edits message |

#### ChatWebSocketController — STOMP WebSocket (not REST)
| Destination | Handler | Description |
|-------------|---------|-------------|
| `/app/chat.typing` | handleTypingEvent | Typing indicator |
| `/app/chat.read` | handleReadReceipt | Read receipts |
| `/app/chat.send` | handleSendMessage | Send via WS |

#### PatientChatController (v1) — `/api/v1/chat`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createChat | Creates new chat |
| POST | `/by-id` | getChatById | Gets chat by ID |
| GET | `/patient/{id}` | getChatByPatientId | Gets by patient ID |
| POST | `/my-chats` | getMyChats | Gets user's chats |
| POST | `/unread` | getUnreadChats | Gets unread chats |
| GET | `/unread/count` | getUnreadCount | Gets unread count |
| POST | `/participants` | addParticipants | Adds participants |
| DELETE | `/participants` | removeParticipant | Removes participant |
| POST | `/read` | markAsRead | Marks as read |
| POST | `/typing` | updateTypingStatus | Updates typing status |
| POST | `/online` | updateOnlineStatus | Updates online status |

---

### consent_template

#### ConsentAcceptedRecordController (v1) — `/api/v1/consent/accepted`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | consentAccept | Accepts consent with file |
| POST | `/records` | getAcceptedRecords | Gets accepted records |

#### ConsentTemplateController (v1) — `/api/v1/consent/template`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | saveConsentTemplate | Saves template |
| DELETE | `/{id}` | deleteConsentTemplate | Deletes template |
| POST | `/list` | getConsentTemplates | Gets templates |
| POST | `/default` | getDefaultConsentTemplate | Gets default template |

---

### dailywins

#### DailyTaskController — `/api/v1/daily-tasks`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/{patient_id}` | getTodayTasks | Gets today's tasks |
| POST | `/mark-complete` | completeTask | Marks task complete |

---

### dashboardlabel

#### DashboardLabelController (v1) — `/api/v1/dashboard/label`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createOrUpdateDashboardLabels | Creates/updates labels |
| DELETE | `/{profile_id}` | getDashboardLabels | Gets/deletes labels |

---

### doctor

#### DoctorController (v1) — `/api/v1/doctor`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/deactivate/subscription` | deactivateSubscription | Deactivates subscription |
| GET | `/mini-dashboard` | getMiniDashboardDetails | Gets mini dashboard |
| POST | `/super-admin` | getSuperAdminDetails | Gets super admin details |

#### DoctorDashboardController (v1) — `/api/v1/doctor/dashboard`
| Method | Path | Handler | Description | Deprecated |
|--------|------|---------|-------------|------------|
| GET | `/counts` | getCountsForDoctor | Gets dashboard counts | No |
| POST | `/list` | getDoctorPatientListDetails | Gets patient list | No |
| GET | `/patient/{id}` | getPatientListResponse | Gets patient by ID | **Yes** ⚠️ |
| GET | `/patient/chat/{id}` | getPatientForChat | Gets patient for chat | No |
| GET | `/waiting/list` | getWaitingListPatient | Gets waiting list | No |
| POST | `/filter` | getFilteredPatients | Gets filtered patients | No |
| GET | `/without/treatment/list` | getPatientsWithoutTreatment | Gets patients without treatment | No |
| GET | `/aligner-journey/{id}` | getAlignerJourneyIdOfPatient | Gets journey ID | No |
| GET | `/upcoming/aligner/change/...` | getUpcomingAlignerChange | Gets upcoming changes | No |
| GET | `/data` | getDoctorDashboardData | Gets dashboard data | No |
| GET | `/mobile/data` | getDoctorMobileDashboardData | Gets mobile dashboard | No |
| GET | `/leads/details/{id}` | getDoctorLeadData | Gets lead details | No |

---

### doctorinvitation

#### DoctorInvitationController (v1) — `/api/v1/doctor/invitation`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | inviteDoctor | Invites a doctor |

---

### flag

#### FlagController — `/api/v1/flag`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| PUT | `/toggle` | toggleFlag | Toggles feature flag |

---

### gettingstarted

#### GettingStartedController (v1) — `/api/v1/getting-started`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/skip` | skipGettingStarted | Skips onboarding |
| POST | `/` | gettingStartedDetails | Gets onboarding details |

---

### invitation

#### InvitationController (v1) — `/api/v1/invitation`
| Method | Path | Handler | Description | Deprecated |
|--------|------|---------|-------------|------------|
| POST | `/` | inviteUser | Invites a patient | No |
| GET | `/by/doctor/{id}` | getAllByDoctor | Gets all by doctor | No |
| POST | `/update` | updateRequest | Updates invitation | No |
| POST | `/patient/status` | changeStatusByPatient | Patient changes status | No |
| POST | `/doctor/status` | changeStatusByDoctor | Doctor changes status | No |
| GET | `/notify/patient/{id}/{name}` | notifyPatient (GET) | Notifies patient | **Yes** ⚠️ |
| POST | `/notify` | notifyPatient (POST) | Notifies patient | No |
| GET | `/doctor-details` | getDoctorDetails | Gets doctor details | No |
| GET | `/doctor/by-email` | getDoctorByPatientEmail | Gets doctor by email | No |
| POST | `/convert-lead` | convertLeadToPatient | Converts lead | No |
| POST | `/validate` | validatePatient | Validates invitation | No |
| POST | `/task-tracker` | createTaskTracker | Creates task tracker | No |

---

### location

#### LocationController (v1) — `/api/v1/location`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getAllLocation | Gets all locations |
| GET | `/countries` | getCountries | Gets countries |
| GET | `/states/{country}` | getStatesByCountry | Gets states |
| GET | `/cities/{state}` | getCitiesByState | Gets cities |
| GET | `/download/csv` | downloadCsv | Downloads CSV |
| GET | `/country-codes` | getCountryCodes | Gets country codes |

---

### material

#### MaterialController (v1) — `/api/v1/material`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/stages` | getAllMaterials | Gets all stages |
| GET | `/shapes/{stage}` | getShapesByStage | Gets shapes |
| GET | `/by-shape/{id}` | getMaterialsByShapeId | Gets by shape |
| GET | `/sizes/{id}` | getSizesByMaterialId | Gets sizes |
| POST | `/add` | addMaterial | Adds material |
| POST | `/add/sizes` | addMaterialSize | Adds sizes |
| POST | `/add/material/tool` | addMaterialTool | Adds tool |
| GET | `/tool/{doctor_id}` | getMaterialsTools | Gets tools |

---

### mcp

#### McpApiExposeController (v1) — `/api/v1/mcp`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | getPatientDetailedSummery | Gets detailed summary for AI |

---

### migration

#### FilePathMigrationController (v1) — `/api/v1/migration/filepath`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/statistics` | getMigrationStatistics | Gets stats |
| POST | `/dry-run` | performDryRun | Dry run migration |
| POST | `/execute` | executeMigration | Executes migration |
| POST | `/rollback` | rollbackMigration | Rollback migration |

#### MigrationController (v1) — `/api/v1/migration`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/file` | migrateOneFile | Migrates single file |

---

### order

#### ManufacturingController — `/api/v1/manufacturing`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/{id}` | getManufacturingDetails | Gets details |
| POST | `/list` | getManufacturingList | Gets list |
| POST | `/` | createManufacturing | Creates record |
| PUT | `/` | updateManufacturing | Updates record |
| POST | `/shipping` (multipart) | updateShippingDetails | Updates shipping |

#### OrderController (v1) — `/api/v1/order`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createOrder | Creates order |
| PUT | `/` | updateOrder | Updates order |
| PUT | `/cancel` | updateToCancelledOrNeedMoreInfo | Cancels order |
| POST | `/details` | getOrder | Gets order |
| POST | `/filter` | getFilteredOrders | Gets filtered |
| GET | `/count` | getOrdersCount | Gets count |
| POST | `/add-timeline-comments` | addComments | Adds comments |
| POST | `/clone` | cloneOrder | Clones order |
| GET | `/comments/{id}` | getComments | Gets comments |
| GET | `/user-count` | getUserOrdersCount | Gets per-user count |
| POST | `/dismiss-zip` | dismissZipFile | Dismisses ZIP |

#### ShippingController (v1) — `/api/v1/shipping`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createShippingDetails | Creates shipping |
| PUT | `/` | updateShippingDetails | Updates shipping |
| PATCH | `/default` | makeDefault | Makes default |
| GET | `/profile/{id}` | getByProfile | Gets by profile |
| GET | `/default` | getDefault | Gets default |
| GET | `/{id}` | getById | Gets by ID |

---

### patient

#### PatientController (v2) — `/api/v2/patient`
| Method | Path | Handler | Description | Deprecated |
|--------|------|---------|-------------|------------|
| PATCH | `/` | updatePatient | Updates patient | No |
| GET | `/` | getPatients | Gets patients | No |
| GET | `/{doctor_id}` | getAllPatients | Gets all by doctor | **Yes** ⚠️ |
| POST | `/all` | getAllPatients | Gets all (POST) | No |
| GET | `/getting-started/...` | gettingStarted | Gets onboarding | No |
| POST | `/getting-started/read` | markAllAsRead | Marks read | No |
| GET | `/overview` | getPatientOverviewDetails | Gets overview (GET) | No |
| POST | `/overview` | getPatientOverviewDetails | Gets overview (POST) | No |
| GET | `/connection-details` | patientConnectionDetails | Gets connections | No |
| POST | `/toggle-stl-view` | toggleStlFileView | Toggles STL view | No |
| POST | `/toggle-tracking` | toggleTracking | Toggles tracking | No |

#### PatientProfileController (v1) — `/api/v1/patient/profile`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/register` | registerPatient | Registers patient |
| POST | `/auth/register` | registerPatientFromAuth | Auth registration |
| GET | `/{id}` | getPatient | Gets by ID |
| GET | `/` | getPatient | Gets with params |
| GET | `/by-email` | getPatientByEmail | Gets by email |
| GET | `/by-uuid` | getPatientByUuid | Gets by UUID |
| PATCH | `/` | updatePatient | Updates patient |
| POST | `/{id}/profile_picture` | updateProfilePicture | Uploads photo |
| POST | `/address` | addPatient | Adds address |
| PATCH | `/address` | updatePatientAddress | Updates address |
| POST | `/delete` | deleteNote | Deletes patient |
| POST | `/language` | updateLanguage | Updates language |
| DELETE | `/by-email` | deleteByEmail | Deletes by email |

#### PatientProfileV2Controller (v2) — `/api/v2/patient/profile`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/{id}/profile_picture` | updateProfilePicture | V2 photo upload |
| POST | `/update_profile_picture/{id}` | updateViaBlog | Updates via blob |
| GET | `/profile-image` | getProfileImage | Gets image stream |

#### ProfileOverviewController (v1) — `/api/v1/patient/overview`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/actions` | getPatientOverviewActions | Gets overview actions |

#### PatientNotesController (v1) — `/api/v1/patient/notes`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | addNote | Adds note |
| PUT | `/` | updateNote | Updates note |
| DELETE | `/{id}` | deleteNote | Deletes note |
| GET | `/patient/{id}` | getNotesByPatientId | Gets by patient |
| GET | `/profile/{id}` | getNotesByProfileId | Gets by profile |

#### PatientCommentsController (v1) — `/api/v1/patient/comments`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/add` (multipart) | addComment | Adds comment |
| DELETE | `/` | deleteComment | Deletes comment |
| GET | `/{patient_id}` | getPatientComments | Gets comments |

#### PatientListController (v1) — `/api/v1/patient/list`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/all` | getAllPatientList | Gets paginated list |
| GET | `/count` | getAllPatientsCount | Gets total count |

#### PatientLeadController (v1) — `/api/v1/patient/lead`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/all/details/{doctor_id}` | getDoctorLead | Gets lead details |
| GET | `/profile/overview/...` | getLeadProfileOverview | Gets lead overview |
| POST | `/status` | changeLeadStatus | Changes status |
| GET | `/by-status` | getPatientWithStatus | Gets by status (GET) |
| POST | `/by-status` | getPatientWithStatus | Gets by status (POST) |
| POST | `/filter` | filterPatientsPost | Filters patients |
| POST | `/update` | updatePatient | Updates lead |

#### UnassignedPatientController (v1) — `/api/v1/patient/unassigned`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/auth/register` | registerPatientFromAuth | Registers unassigned |

---

### patient_onboarding

#### PatientOnboardingController — `/api/v1/patient/onboarding`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/move` | movePatientOnboarding | Moves through steps |
| GET | `/{patient_id}` | getOnboardingStatus | Gets status |

---

### payment

#### PaymentController (v1) — `/api/v1/payment`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getPayments | Gets payments |
| POST | `/cost` | setTreatmentCost | Sets cost |
| POST | `/` | addPayment | Adds payment |
| POST | `/update` | updatePayment | Updates payment |
| POST | `/delete` | deletePayment | Deletes payment |
| POST | `/filter` | filterPayments | Filters payments |

#### PaymentReminderController (v1) — `/api/v1/payment/reminder`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | setPaymentReminder | Sets reminder |
| POST | `/update` | updatePaymentReminder | Updates reminder |
| POST | `/delete` | deletePaymentReminder | Deletes reminder |

---

### practice

#### PracticeController (v1) — `/api/v1/practice`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createPractice | Creates practice |

---

### prescription

#### PrescriptionController — `/api/v1/prescription`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/add` | addPrescription | Adds prescription |
| GET | `/{id}` | getPrescription | Gets by ID |
| GET | `/patient/{id}` | getByPatient | Gets by patient |
| PUT | `/` | updatePrescription | Updates prescription |
| DELETE | `/{id}` | deletePrescription | Deletes prescription |

---

### rbac

#### AccessController (v1) — `/api/v1/access`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/plans` | createPlan | Creates plan |
| GET | `/plans/{id}` | getPlanById | Gets plan |
| POST | `/sub-roles` | createSubRole | Creates sub-role |
| GET | `/sub-roles/{id}` | getSubRoleById | Gets sub-role |
| POST | `/modules` | createModule | Creates module |
| GET | `/modules/{id}` | getModuleById | Gets module |
| POST | `/sub-modules` | createSubModule | Creates sub-module |
| GET | `/sub-modules/{id}` | getSubModuleById | Gets sub-module |
| POST | `/assign` | assignSubRoleToUser | Assigns sub-role |
| POST | `/roles-and-permissions` | getAccessControlResponse | Gets full RBAC |
| POST | `/roles-and-permissions-minimal` | getMinimal | Gets minimal RBAC |
| POST | `/custom-roles` | createCustomRoles | Creates custom roles |
| PUT | `/edit/custom-roles` | editCustomRole | Edits custom role |
| POST | `/users` | getUsers | Gets users |
| POST | `/assign-sub-module-permission` | assignPermissions | Assigns permissions |
| POST | `/subroles/copy-module-permissions` | copyPermissions | Copies permissions |

#### AuditLogController (v1) — `/api/v1/audit`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createAuditLog | Creates log |
| GET | `/` | getAuditLogs | Gets paginated logs |

---

### reminder

#### ReminderController (v1) — `/api/v1/reminder`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | setCustomAppointmentReminder | Sets reminder |
| POST | `/update` | updatePaymentReminder | Updates reminder |
| POST | `/delete` | deletePaymentReminder | Deletes reminder |

---

### rewards

#### CoinAdjustmentController (v1) — `/api/v1/rewards/coins`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/adjust` | adjustCoins | Adjusts coins |

#### PatientPromotionController (v1) — `/api/v1/rewards/promotions`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/active` | getActivePromotions | Gets active promos |
| POST | `/claim` | claimPromotion | Claims promo |
| GET | `/claims/{id}/all` | getPendingClaims | Gets pending claims |
| POST | `/claims` | getClaimsForDoctor | Doctor's claims |
| POST | `/verify` | verifyPromotionClaim | Verifies claim |
| GET | `/all` | getAllPromotions | Gets all promos |
| POST | `/` | createPromotion | Creates promo |
| PUT | `/` | updatePromotion | Updates promo |
| PATCH | `/end/{id}` | endPromotion | Ends promo |

#### PatientRewardController (v1) — `/api/v1/rewards`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/products` | getAvailableProducts | Gets products |
| GET | `/products/{id}` | getProductDetails | Gets product details |
| POST | `/orders` | placeOrder | Places order |
| GET | `/orders` | getMyOrders | Gets my orders |
| POST | `/orders-and-claims` | getOrderAndClaims | Gets orders+claims |
| GET | `/orders/{id}` | getOrderDetails | Gets order details |
| POST | `/orders/{id}/cancel` | cancelOrder | Cancels order |

#### PatientRewardDashboardController (v1) — `/api/v1/rewards/dashboard`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getDashboard | Gets reward dashboard |

#### PatientTaskController (v1) — `/api/v1/rewards/tasks`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getAvailableTasks | Gets tasks |
| POST | `/complete` | completeTask | Completes task |
| GET | `/history` | getTaskHistory | Gets history |
| POST | `/completed-task` | getCompletedTasks | Gets completed |
| POST | `/wellness/completed-task` | getWellnessCompleted | Gets wellness |

#### PatientWalletController (v1) — `/api/v1/rewards/wallet`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getWallet | Gets wallet |
| GET | `/transactions` | getTransactions | Gets transactions |
| POST | `/all` | getPatientRewards | Gets all rewards |

#### RewardOrderController (v1) — `/api/v1/rewards/orders/admin`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/all` | getAllOrders | Gets all orders |
| POST | `/dashboard` | getDashboardForDoctor | Gets dashboard |
| POST | `/approve` | approveOrder | Approves order |
| POST | `/reject` | rejectOrder | Rejects order |
| POST | `/fulfill` | fulfillOrder | Fulfills order |

#### RewardProductConfigController (v1) — `/api/v1/rewards/config/products`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getAllProducts | Gets products |
| POST | `/` | createProduct | Creates product |
| POST | `/with-image` (multipart) | addWithImage | Creates with image |
| PUT | `/` | updateProduct | Updates product |
| PUT | `/with-image` (multipart) | updateWithImage | Updates with image |
| PATCH | `/{id}/inventory` | updateInventory | Updates inventory |
| DELETE | `/{id}` | deleteProduct | Deletes product |

#### RewardTaskConfigController (v1) — `/api/v1/rewards/config/tasks`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getAllTasks | Gets all tasks |
| POST | `/` | createTask | Creates task |
| PUT | `/` | updateTask | Updates task |
| PATCH | `/{id}/toggle` | toggleTask | Toggles task |
| DELETE | `/{id}` | deleteTask | Deletes task |
| POST | `/clone-default-tasks` | cloneDefaultTasks | Clones defaults |

---

### sampledata

#### DashboardController (v5) — `/api/v5/dashboard`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/enterprise` | getEnterpriseDashboard | Enterprise dashboard |
| GET | `/manufacturing` | getManufacturingDashboard | Manufacturing dashboard |
| GET | `/planning` | getPlanningDashboard | Planning dashboard |
| GET | `/general` | getGeneralDashboard | General dashboard |
| GET | `/practice` | getPracticeDashboard | Practice dashboard |
| GET | `/in-house-lab` | getInHouseLabDashboard | In-house lab dashboard |
| GET | `/admin` | getAdminDashboard | Admin dashboard |
| GET | `/profile/{id}` | getProfileDashboard | Profile dashboard |
| GET | `/report/{type}` | getReport | Dashboard report |
| POST | `/manufacturing/orders` | createManufacturingOrder | Creates mfg order |
| POST | `/profile/update` | updateProfile | Updates profile |
| GET | `/public-stats` | getPublicStats | Public statistics |

---

### search

#### GlobalSearchController (v1) — `/api/v1/search`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | search | Global search |

---

### smartbox

#### SmartBoxController (v1) — `/api/v1/smartbox`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getSmartBoxStatus | Gets status |
| POST | `/register` | registerSmartBox | Registers box |

---

### storage

#### FileController (v1) — `/api/v1/file`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/folder` | createFolder | Creates folder |
| GET | `/` | getFiles | Gets files |
| POST | `/` (multipart) | uploadFiles | Uploads files |
| POST | `/from-chat` (multipart) | uploadFilesFromChat | Uploads from chat |
| POST | `/by-ids` | getFilesById | Gets by IDs |
| POST | `/by-names` | getFilesByNames | Gets by names |
| POST | `/rename` | renameFile | Renames file |
| POST | `/move` | moveFile | Moves file |
| POST | `/move-multiple` | moveFiles | Moves multiple |
| POST | `/delete` | deleteFiles | Deletes multiple |
| POST | `/download` | downloadFile | Downloads file |
| POST | `/folder-size` | getFolderSizeInMb | Gets folder size |
| GET | `/total-size` | getDoctorTotalFileSize | Gets total size |
| POST | `/toggle-stl-view` | toggleStlFileView | Toggles STL view |

#### DraftFileController (v1) — `/api/v1/file/draft`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | uploadFiles | Uploads drafts |

#### GalleryController (v1) — `/api/v1/gallery`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | uploadAlignerPhoto | Uploads photo |
| POST | `/multiple` (multipart) | uploadAlignerPhotos | Uploads multiple |
| POST | `/pre-aligner` (multipart) | uploadPreAlignerPhotos | Uploads pre-aligner |
| GET | `/{patient_id}` | getAlignerPhoto | Gets photos |
| POST | `/delete` | deleteAlignerPhoto | Deletes photos |

#### GoogleDriveController — `/patient/drive`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/authorize` | authorize | OAuth2 authorize |
| GET | `/authorized` | handleCallback | OAuth callback |
| GET | `/stream` | streamDriveFile | Streams file |
| POST | `/upload` | uploadFile | Uploads file |
| GET | `/download` | downloadFile | Downloads file |
| GET | `/download-folder` | downloadFolder | Downloads as ZIP |
| POST | `/folder` | createFolder | Creates folder |
| DELETE | `/file` | deleteFile | Deletes file |
| POST | `/copy` | copyFile | Copies file |
| POST | `/move` | moveFile | Moves file |
| POST | `/rename-folder` | renameFolder | Renames folder |
| GET | `/folder-size` | getFolderSize | Gets folder size |
| GET | `/file` | getFile | Gets file |
| POST | `/share` | shareFile | Shares file |
| POST | `/un-share` | unShare | Un-shares file |
| POST | `/share-to-admin` | shareFolderToAdmin | Shares to admin |

#### OptimizedDriveController — `/patient/drive/optimized`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/upload` | uploadFile | Optimized upload |
| POST | `/multiple-upload` | batchUploadFiles | Batch upload |

#### FileMigrationController — `/api/v1/file/migration`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/profile` | migrateFiles | Migrates for profile |
| POST | `/manual` | manuallyMigrateFiles | Manual migration |
| GET | `/progress/{id}` | getProgress | Gets progress |
| POST | `/migrate` | migrate | Triggers migration |
| POST | `/move` | moveFile | Moves file |
| POST | `/check-status` | checkMigrationStatus | Checks status |

#### S3CleanupController — `/api/v1/s3/cleanup`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| DELETE | `/migrated` | cleanupMigratedFiles | Cleans up S3 |

---

### subcription (subscription)

#### SubscriptionController (v1) — `/api/v1/subscription`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/create` | createCustomerAndAddBasicPlan | Creates customer |
| POST | `/extend/subscription` | extendSubscription | Extends subscription |
| GET | `/whatsapp` | isWhatsAppMessagingDetails | WhatsApp details |

#### SubscriptionPlanController (v1) — `/api/v1/subscription/plan`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/details` | getSubSubscriptionDetails | Gets details |
| POST | `/flag` | updateSubscriptionFlag | Updates flag |
| GET | `/details/{doctor_id}` | getDetailsByDoctor | Gets by doctor |
| GET | `/upgrade-flag/{id}` | makeFalseUpgradeFlag | Resets flag |
| POST | `/account-upgrade` | upgradeAccount | Upgrades account |
| GET | `/deactivate/{id}` | deactivateAccount | Deactivates account |
| GET | `/details/by-email` | getDetailsByEmail | Gets by email |
| POST | `/toggle-is-demo-completed` | toggleDemo | Toggles demo |
| POST | `/upgrade` | updateSubscription | Upgrades plan |

---

### timeline

#### TimelineController (v1) — `/api/v1/timeline`
| Method | Path | Handler | Description | Deprecated |
|--------|------|---------|-------------|------------|
| GET | `/all/{doctor_id}` | getAllUpdates | Gets all updates | No |
| GET | `/event/ids/{doctor_id}` | getTheEventIds | Gets event IDs | No |
| GET | `/all` | getAllUpdates | Gets paginated | **Yes** ⚠️ |
| GET | `/{user_type}/{user_id}` | getTimeline | Gets for user | No |
| POST | `/event/inactivate` | inactivateEvent | Inactivates event | No |
| POST | `/events/inactivate` | inactivateEvents | Inactivates multiple | No |
| POST | `/events/read` | readEvents | Marks read | No |
| GET | `/events/read-all` | readAllEvent | Marks all read | No |
| POST | `/event` | addEvent | Adds event | No |
| POST | `/without/patient/event` | addEventWithoutPatient | Adds without patient | No |
| POST | `/note-event` | addTimelineNoteEvent | Adds note event | No |

---

### tracking

#### TrackingController (v1) — `/api/v1/tracking`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getTrackingDetailsForPatient | Gets details |
| POST | `/toggle` | toggleTracking | Toggles tracking |
| POST | `/stl-toggle` | toggleDetails | Toggles STL details |

---

### treatment

#### TreatmentController (v1) — `/api/v1/treatment`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | getTreatmentList | Gets list |
| GET | `/plan/{id}` | getTreatmentPlan | Gets plan by ID |
| POST | `/plan` (multipart) | createOrUpdateTreatmentPlan | Creates/updates with files |
| GET | `/plan` | getTreatmentPlan | Gets with params |
| POST | `/attach-shipping` | attachShippingToTreatment | Attaches shipping |
| POST | `/plan/workflow` | getTreatmentPlanWorkflow | Gets workflow |
| DELETE | `/plan/{id}` | deleteTreatmentPlan | Deletes plan |
| POST | `/` | addOrUpdateTreatment | Adds/updates treatment |
| GET | `/braces-and-aligner` | getBracesAndAlignerList | Gets both types |
| GET | `/patient-details` | getPatientTreatmentDetails | Gets patient details |
| POST | `/approve` | approvedPlanByPatient | Patient approves |
| POST | `/complete` | completeTreatment | Completes treatment |

#### SummaryController (v1) — `/api/v1/summary`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/{patient_id}` | getPatientSummaryDetails | Gets summary |

---

### treatment_insights

#### TreatmentInsightController — `/api/v1/treatment-insights`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/today` | getInsights | Gets today's insights |

---

### treatmenttracking

#### AlignerTrackingPlanController (v1) — `/api/v1/tracking/plan`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createPlan | Creates plan |
| GET | `/patient/{id}` | getPlansForPatient | Gets for patient |
| GET | `/{id}` | getPlan | Gets plan |
| PATCH | `/{id}/status` | updateStatus | Updates status |
| POST | `/{id}/extend-current` | extendCurrent | Extends current |
| POST | `/{id}/extend-all` | extendAll | Extends all |
| POST | `/{id}/revert` | revert | Reverts changes |
| POST | `/{id}/move-aligner` | moveAligner | Moves to aligner |
| POST | `/{id}/patient-change` | patientChangeAligner | Patient changes |
| POST | `/{id}/checkin` | checkIn | Check-in |
| POST | `/{id}/issue` | reportIssue | Reports issue |

#### ChatController (v1) — `/api/v1/tracking/chat`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/doctor/send` | doctorSend | Doctor sends |
| POST | `/patient/send` | patientSend | Patient sends |
| GET | `/history/{patient_id}` | getChatHistory | Gets history |
| PATCH | `/read` | markRead | Marks read |
| POST | `/review` | submitAlignerReview | Submits review |

---

### vsp

#### VspController (v1) — `/api/v1/vsp`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/orders` | createOrder | Creates VSP order |
| GET | `/orders/{id}` | getOrder | Gets order |
| GET | `/orders/patient/{id}` | getOrdersByPatient | Gets by patient |
| PUT | `/orders` | updateOrder | Updates order |
| PATCH | `/orders/{id}/status` | updateOrderStatus | Updates status |
| POST | `/case-records` | createCaseRecord | Creates case record |
| GET | `/case-records/{id}` | getCaseRecord | Gets case record |
| PUT | `/case-records/{id}` | updateCaseRecord | Updates record |
| GET | `/case-records/patient/{id}` | getByPatient | Gets by patient |
| GET | `/case-records/order/{id}` | getByOrder | Gets by order |
| GET | `/orders/{id}/status` | getOrderStatus | Gets status |
| POST | `/prescriptions` | createPrescription | Creates prescription |
| GET | `/prescriptions/{id}` | getPrescription | Gets prescription |
| PUT | `/prescriptions/{id}` | updatePrescription | Updates prescription |
| GET | `/prescriptions/patient/{id}` | getByPatient | Gets by patient |
| GET | `/prescriptions/order/{id}` | getByOrder | Gets by order |
| POST | `/treatment-plans` | createTreatmentPlan | Creates plan |
| GET | `/orders/{id}/treatment-plans` | getByOrder | Gets by order |
| PUT | `/treatment-plans/{id}` | updatePlan | Updates plan |
| POST | `/treatment-plans/{id}/submit` | submitPlan | Submits plan |
| DELETE | `/treatment-plans/{id}` | deletePlan | Deletes plan |
| POST | `/patient-details` | getPatientDetails | Gets details |
| POST | `/mini-dashboard` | getMiniDashboard | Gets dashboard |

#### VspProductionController — `/api/v1/vsp/production`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createProduction | Creates production |
| GET | `/{id}` | getProduction | Gets production |
| GET | `/order/{id}` | getByOrderId | Gets by order |
| PUT | `/` | updateProduction | Updates production |
| PATCH | `/{id}/status` | updateStatus | Updates status |
| POST | `/shipping` | addShipping | Adds shipping |
| PUT | `/shipping` | updateShipping | Updates shipping |

#### VspBillingDetailsController (v1) — `/api/v1/vsp/billing`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createBillingDetails | Creates billing |
| GET | `/default` | getDefault | Gets default |
| GET | `/{id}` | getById | Gets by ID |
| GET | `/profile` | getByProfile | Gets by profile |

#### VspShippingDetailsController (v1) — `/api/v1/vsp/shipping`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createShippingDetails | Creates shipping |
| GET | `/default` | getDefault | Gets default |
| GET | `/{id}` | getById | Gets by ID |
| GET | `/profile` | getByProfile | Gets by profile |

---

### workflow

#### PatientTaskTrackerController — `/api/v1/workflow/task`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createPatientTaskTracker | Creates task |
| PUT | `/` | updatePatientTaskTracker | Updates task |
| PUT | `/move` | movePatientTaskTracker | Moves task |
| PUT | `/move/multi-task` | moveMultiple | Moves multiple |
| POST | `/change-workflow` | changeWorkFlow | Changes workflow |
| POST | `/filter` | getAllWithFilter | Gets filtered tasks |
| POST | `/cancelled` | getCancelledWithFilter | Gets cancelled |
| POST | `/dashboard` | getDashboardData | Gets dashboard |
| POST | `/individual` | getIndividualTasks | Gets individual tasks |
| POST | `/mcp` | getTasksByPatientDetails | Gets for MCP |
| POST | `/ongoing-production-list` | getOngoingProduction | Gets ongoing |
| GET | `/counts/{profile_id}` | getWorkflowCounts | Gets kanban counts |

#### KanbanController (v1) — `/api/v1/workflow/kanban`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/summary` | getWorkflowKanbanSummary | Gets summary |

#### WorkflowManagementController (v1) — `/api/v1/workflow`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createWorkflow | Creates workflow |
| PUT | `/` | updateWorkflow | Updates workflow |
| GET | `/` | getWorkflows | Gets workflows |
| POST | `/kanban-board` | getKanbanBoard | Gets kanban |
| DELETE | `/{id}` | deleteWorkflow | Deletes workflow |
| PUT | `/{id}/archive` | archiveWorkflow | Archives workflow |
| POST | `/statuses` | createStatus | Creates status |
| PUT | `/statuses` | updateStatus | Updates status |
| DELETE | `/statuses` | deleteStatus | Deletes status |
| PUT | `/statuses/{id}/position` | updatePosition | Updates position |
| POST | `/services` | createService | Creates service |
| PUT | `/services/{id}` | updateService | Updates service |
| GET | `/services/{id}` | getServiceById | Gets service |
| GET | `/services` | getServices | Gets services |
| DELETE | `/services/{id}` | deleteService | Deletes service |
| PUT | `/assign` | assignWorkflowToUser | Assigns to user |

#### ManufacturingBatchCheckListController — `/api/v1/workflow/checklist`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | create | Creates item |
| POST | `/batch` | createMultiple | Creates multiple |
| PUT | `/{id}` | update | Updates item |
| DELETE | `/{id}` | delete | Deletes item |
| GET | `/{id}` | getById | Gets by ID |
| GET | `/batch/{batchId}` | getByBatch | Gets by batch |

#### MyTaskController — `/api/v1/workflow/my-task`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/add` | addMyTask | Adds task |
| POST | `/by-id` | getMyTaskById | Gets by ID |
| POST | `/all` | getAllMyTasks | Gets all tasks |
| PUT | `/` | updateMyTask | Updates task |
| DELETE | `/{id}` | deleteByTaskId | Deletes task |

#### ActivityController — `/api/v1/workflow/activity`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | getAllActivities | Gets activities |
| POST | `/merge` | getMergeCommentsAndActivities | Gets merged |

#### PatientPreTreatmentController — `/api/v1/workflow/pre-treatment`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createPreTreatmentDetails | Creates details |
| PUT | `/{id}` | updatePreTreatmentDetails | Updates details |
| GET | `/{patient_id}` | getPreTreatmentDetails | Gets details |

#### CardDisplayConfigController — `/api/v1/workflow/card`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/card-display-configs` | createConfig | Creates config |
| PUT | `/card-display-configs/{id}` | updateConfig | Updates config |
| GET | `/card-display-configs/{id}` | getById | Gets by ID |
| GET | `/card-display-configs/profile/{id}` | getByProfile | Gets by profile |
| GET | `/card-display-configs` | getConfigs | Gets all |
| DELETE | `/card-display-configs/{id}` | deleteConfig | Deletes config |
| POST | `/card-display-configs/{id}/fields` | createField | Creates field |
| PUT | `/card-display-fields/{id}` | updateField | Updates field |
| GET | `/card-display-configs/{id}/fields` | getFields | Gets fields |
| DELETE | `/card-display-fields/{id}` | deleteField | Deletes field |
| PUT | `/card-display-fields/{id}/position` | updatePosition | Updates position |

#### ServiceConfigurationController — `/api/v1/workflow/service-config`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createServiceItem | Creates item |
| GET | `/` | getAllServiceItems | Gets all items |
| POST | `/assign` | assignToUser | Assigns to user |
| GET | `/profile/{id}` | getByProfile | Gets by profile |
| DELETE | `/` | removeConfig | Removes config |
| POST | `/enable` | enableForUser | Enables items |
| POST | `/disable` | disableForUser | Disables items |
| POST | `/remove` | removeForUser | Removes items |

#### ProductController — `/api/v1/workflow/product`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` (multipart) | createServiceProduct | Creates with image |
| GET | `/profile/{id}` | getByProfile | Gets by profile |
| GET | `/category/{id}` | getByCategory | Gets by category |
| GET | `/{id}` | getById | Gets by ID |
| POST | `/filter` | getByFilter | Gets filtered |
| PUT | `/{id}` | updateProduct | Updates product |
| DELETE | `/{id}` | deleteProduct | Deletes product |
| POST | `/{id}/toggle` | toggleStatus | Toggles status |
| POST | `/default/assign` | addDefaultProduct | Assigns default |

#### ServiceProductV1Controller (v1) — `/api/v1/workflow/service-product`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | getAllServiceProduct | Gets all (v1) |

#### ServiceProductV2Controller (v2) — `/api/v2/workflow/service-product`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | getAllServiceProduct | Gets all (v2) |

#### CustomerProductMappingController — `/api/v1/workflow/customer-product`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/disable` | disableForCustomer | Disables product |
| POST | `/enable` | enableForCustomer | Enables product |

#### CustomerAdminProductMappingController — `/api/v1/workflow/customer-admin-product`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/assign` | assignToCustomer | Assigns product |
| DELETE | `/assign/remove` | removeFromCustomer | Removes product |
| GET | `/{customer_id}` | getForCustomer | Gets products |

#### ProductCategoryController — `/api/v1/workflow/product-category`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | createCategory | Creates category |
| GET | `/profile/{id}` | getByProfile | Gets by profile |
| POST | `/filter` | getByFilter | Gets filtered |
| GET | `/{id}` | getById | Gets by ID |

---

*See also:*
- [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)
- [Data Model](./03-DATA-MODEL.md)
