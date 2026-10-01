export const BASE_AUTH_URL = process.env.REACT_APP_BASE_APP_AUTH_URL
export const BASE_APP_PATIENT_URL = process.env.REACT_APP_BASE_APP_PATIENT_URL
export const BASE_APP_DOCTOR_URL = process.env.REACT_APP_BASE_APP_DOCTOR_URL
export const BASE_OTHER_URL = process.env.REACT_APP_BASE_APP_CHAT_URL
export const BASE_SMILE_SIMULATION = process.env.REACT_APP_BASE_SMILE_SIMULATION_URL
export const URL_EMAIL_OTP_SEND = BASE_AUTH_URL + '/auth/v2/email/otp' //used in Sign up
export const URL_EMAIL_OTP_SEND_FOR_EXISTING_USERS = BASE_AUTH_URL + '/auth/v1/profile-exists' //used in Sign up
export const URL_GET_INVITE_DETAILS = BASE_APP_DOCTOR_URL + '/doctor/invitation/v1'
export const URL_INVITATION_COUNTS_BY_ROLES =
  BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/counts-by-roles'
export const URL_EMAIL_OTP_VERIFY = BASE_AUTH_URL + '/auth/v2/email/otp/validate' //verify otp in forget n signup for mail

// AUTH
export const URL_GET_ORGANIZATION_DETAILS = BASE_APP_DOCTOR_URL + '/doctor/v1/organization?email='
export const URL_REGISTRATION_STEP_ONE = BASE_AUTH_URL + '/auth/v2/signup/password/start'
export const URL_FORGET_OTP_SENT = BASE_AUTH_URL + '/auth/v2/password/reset/email/otp'
export const URL_FORGET_OTP_VERIFY = BASE_AUTH_URL + '/auth/v2/password/reset/validate'
export const URL_FORGET_PASSWORD_RESET = BASE_AUTH_URL + '/auth/v2/password/reset'

export const URL_SIGNUP_GOOGLE_STEP_ONE = BASE_AUTH_URL + '/auth/v2/signup/google/start'
export const URL_SIGNUP_GOOGLE_STEP_TWO = BASE_AUTH_URL + '/auth/doctor/v1/signup/google'
export const URL_SIGNUP_GOOGLE = BASE_AUTH_URL + '/auth/v2/login/google'
export const URL_MOBILE_OTP_SENT = BASE_AUTH_URL + '/auth/v2/mobile/otp'

export const URL_SIGNUP_APPLE_STEP_ONE = BASE_AUTH_URL + '/auth/v2/signup/apple/start'
export const URL_SIGNUP_APPLE_STEP_TWO = BASE_AUTH_URL + '/auth/doctor/v1/signup/apple'
export const URL_SIGNUP_APPLE = BASE_AUTH_URL + '/auth/v2/login/apple'

export const URL_OTP_SENT = BASE_AUTH_URL + '/auth/v1/mobile/otp'
export const URL_MOBILE_OTP_VALIDATE = BASE_AUTH_URL + '/auth/v1/mobile/otp/validate'
export const URL_SIGNUP_LOGIN = BASE_AUTH_URL + '/auth/doctor/v1/signup/password'
export const URL_SIGNUP_OR_LOGIN_FOR_CONNECTED_ORG_USER =
  BASE_AUTH_URL + '/auth/doctor/v2/signup/url'
export const URL_AUTH_UPDATE_DETAILS = BASE_AUTH_URL + '/auth/doctor/v2/update/details'
export const URL_LOGIN = BASE_AUTH_URL + '/auth/v2/login/password'
export const URL_LOGIN_PROFILES_BY_EMAIL =
  BASE_APP_DOCTOR_URL + '/doctor/profile/management/v1/profiles?email='
export const URL_SSO_LOGIN = BASE_AUTH_URL + '/auth/v1/sso/login/'
export const URL_LOGOUT_LOGIN_SESSION = BASE_AUTH_URL + '/auth/v2/logout-device'
export const URL_SESSION_CHECK = BASE_AUTH_URL + '/auth/v1/device/'
export const URL_ADD_DOCTOR_PRODUCT = BASE_APP_DOCTOR_URL + '/doctor/v1/product'
export const URL_REFRESH_TOKEN = BASE_AUTH_URL + '/auth/token/v1/token/refresh'
export const URL_LOGIN_PROFILE_BY_EMAIL_AND_PASSWORD =
  BASE_APP_DOCTOR_URL + '/doctor/profile/management/v1/profiles'
// Chat
export const URL_CHAT_LIST = BASE_OTHER_URL + '/chat/v2/dashboard'
export const URL_CHAT_SEEN = BASE_OTHER_URL + '/chat/v1/chat/message/seen'
export const URL_CHAT_SEND = BASE_OTHER_URL + '/chat/v1/add/chat/request'
export const URL_MESSAGE_LIST = BASE_OTHER_URL + '/chat/v2/chat/details/'
export const URL_ADD_NEW_CHAT = BASE_OTHER_URL + '/chat/v1/add/to/chat'
export const URL_CHAT_LIST_PATIENT = BASE_APP_PATIENT_URL + '/patient/aligner/v1/filter'
export const URL_LAB_CHATS = BASE_APP_PATIENT_URL + '/patient/v2/chats/my-chats'
export const URL_LAB_CHAT_BY_ID = BASE_APP_PATIENT_URL + '/patient/v1/chats/get-by-id'
export const URL_LAB_CHAT_PARTICIPANTS = BASE_APP_PATIENT_URL + '/patient/v1/chats/participants'
export const URL_LAB_CHAT_MESSAGES = BASE_APP_PATIENT_URL + '/patient/v1/messages/chat'
export const URL_LAB_SEND_MESSAGE = BASE_APP_PATIENT_URL + '/patient/v1/messages'
export const URL_LAB_ALIGNER_CHECK_INS = BASE_APP_PATIENT_URL + '/patient/v1/aligner-check-ins'
export const URL_CREATE_CASE_TEAM = BASE_APP_PATIENT_URL + '/patient/v1/case-teams'

// Dashboard
export const URL_DASHBOARD_COUNTS =
  BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v1/get/count?doctorId='
export const URL_DASHBOARD_UPDATES_NOTIFICATION =
  BASE_APP_PATIENT_URL + '/patient/timeline/v2/updates/page'
export const URL_NUDGE_PATIENT = BASE_OTHER_URL + '/chat/v1/multiple/send'
export const URL_DEACTIVATE_EVENT_UPDATE =
  BASE_APP_PATIENT_URL + '/patient/timeline/v1/event/inactivate'
export const URL_DEACTIVATE_EVENT_LIST =
  BASE_APP_PATIENT_URL + '/patient/timeline/v1/events/read/all'
export const URL_ADD_DOCTOR_ACTIVITY_TRACK = BASE_APP_DOCTOR_URL + '/doctor/activity/v1/add'
export const URL_CHAT_EVENT_ID = BASE_APP_PATIENT_URL + '/patient/timeline/v1/event/ids/'

// Doctor Profile
export const URL_ALL_BRAND_LIST = BASE_APP_DOCTOR_URL + '/doctor/brand/v1/get/'
export const URL_GET_DOCTOR_PROFILE = BASE_APP_DOCTOR_URL + '/doctor/v1/?doctor_id='
export const URL_UPDATE_PROFILE = BASE_APP_DOCTOR_URL + '/doctor/v1/doctor/update'

// Invite patient
export const URL_INVITE_PATIENT =
  BASE_APP_PATIENT_URL + '/patient/new/invitation/v1/notify/patient/'
export const URL_ADD_PATIENT = BASE_APP_PATIENT_URL + '/patient/invitation/v2/'
export const URL_ADD_PATIENT_FOR_STARTER =
  BASE_APP_PATIENT_URL + '/patient/new/invitation/v1/patient'
// export const URL_ADD_PATIENT = BASE_APP_PATIENT_URL + '/patient/new/invitation/v1/patient'
export const URL_GET_PATIENT_DETAILS = BASE_APP_PATIENT_URL + '/patient/profile/v1'
export const URL_ADD_PATIENT_UPDATE = BASE_APP_PATIENT_URL + '/patient/new/invitation/v1/update'

//Practice Location API
export const URL_ACTIVE_CLINIC_LIST = BASE_APP_DOCTOR_URL + '/doctor/practice/location/v1/active'
export const URL_CLINIC_LIST = BASE_APP_DOCTOR_URL + '/doctor/practice/location/v1/'
export const URL_ADD_CLINIC = BASE_APP_DOCTOR_URL + '/doctor/practice/location/v1/add'
export const URL_CLINIC_STATUS_CHANGE =
  BASE_APP_DOCTOR_URL + '/doctor/practice/location/v1/practice/location/assignto/patient'
export const URL_EDIT_CLINIC =
  BASE_APP_DOCTOR_URL + '/doctor/practice/location/v1/practice/location/update'

export const URL_GET_GOOGLE_MAPS_DATA = (placeId: string) =>
  BASE_APP_DOCTOR_URL +
  `/doctor/practice/location/v1/getGoogleMapsData?placeId=${placeId}&apiKey=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`

//Location API
export const URL_COUNTRY_FETCH = BASE_APP_PATIENT_URL + '/patient/location/v1/countries'
export const URL_STATE_FETCH = BASE_APP_PATIENT_URL + '/patient/location/v1/states/'
export const URL_CITY_FETCH = BASE_APP_PATIENT_URL + '/patient/location/v1/cities'
export const URL_COUNTRY_CODE_LIST = BASE_APP_PATIENT_URL + '/patient/location/v1/get/country-codes'

// My Patients
export const URL_ALL_PATIENTS = BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v1/get/list'

export const URL_FILTER_PATIENTS = BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v1/filter'

export const URL_BRACES_PATIENTS_LIST = BASE_APP_PATIENT_URL + '/patient/braces/v2/'

// New Patients
export const URL_NEW_PATIENT_LIST = BASE_APP_PATIENT_URL + '/patient/lead/v1/details'
export const URL_ARCHIVE_LEAD_LIST = BASE_APP_PATIENT_URL + '/patient/lead/v1/by/status'
export const URL_LEADS_FILTER_LIST = BASE_APP_PATIENT_URL + '/patient/lead/v1/filter'
export const URL_ADD_CUSTOM_BRAND_NAME =
  BASE_APP_PATIENT_URL + '/patient/aligner/production/lab/v1/'
export const URL_ADD_DEFAULT_BRAND_NAME =
  BASE_APP_PATIENT_URL + '/patient/aligner/production/lab/v1/'
// Patient profile
// Profile view
export const URL_PATIENT_PROFILE_OVERVIEW_ACTIONS =
  BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/details/'
export const URL_PATIENT_PROFILE_APPROVE_ALL_PENDING_ACTION =
  BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/approve-all-pending-action/'

// Timeline
export const URL_ALL_TIMELINE = BASE_APP_PATIENT_URL + '/patient/timeline/v1/PATIENT/'
export const URL_TIMELINE_NOTE_ADD = BASE_APP_PATIENT_URL + '/patient/timeline/v1/note'

// Treatment plan
export const URL_TREATMENT_DEACTIVATE = BASE_APP_PATIENT_URL + '/patient/aligner/v1/discard/'
export const URL_WEAR_DAYS_UPDATE = BASE_APP_PATIENT_URL + '/patient/aligner/v1/update/wear-days'
export const URL_TREATMENT_LIST = BASE_APP_PATIENT_URL + '/patient/aligner/v1/'
export const URL_TREATMENT_PLAN = BASE_APP_PATIENT_URL + '/patient/aligner/v1/'
export const URL_TREATMENT_PLAN_EDIT_ALIGNER_DETAILS =
  BASE_APP_PATIENT_URL + '/patient/aligner/v1/update/start-date'
export const URL_TREATMENT_PLAN_EDIT_SINGLE_ALIGNER_DETAILS =
  BASE_APP_PATIENT_URL + '/patient/aligner/v1/update/aligner'
export const URL_TREATMENT_PLAN_SAVE_LATER = BASE_APP_PATIENT_URL + '/patient/aligner/v1/'
export const URL_GET_PRODUCTION_LOGS =
  BASE_APP_PATIENT_URL + '/patient/aligner/production/v1/update/logs/'

// Wear stats
export const URL_ALIGNER_WISE_WEAR_STATS = BASE_APP_PATIENT_URL + '/patient/aligner/v1/stats/'
export const URL_ALL_ALIGNER_WEAR_STATS = BASE_APP_PATIENT_URL + '/patient/aligner/v1/stats/'
export const URL_STATUS_PRODUCTION_LAB_UPDATE =
  BASE_APP_PATIENT_URL + '/patient/aligner/v2/update/wear-days/production-lab'

// Set up treatment
export const URL_PRODUCTION_LIST = BASE_APP_PATIENT_URL + '/patient/aligner/production/lab/v1/'
export const URL_NEW_TREATMENT = BASE_APP_PATIENT_URL + '/patient/aligner/v1'

// Production
export const URL_ADD_REMINDER = BASE_APP_PATIENT_URL + '/patient/aligner/production/reminder/v1/'
export const URL_UPDATE_REMINDER =
  BASE_APP_PATIENT_URL + '/patient/aligner/production/reminder/v1/update'
export const URL_DELETE_REMINDER =
  BASE_APP_PATIENT_URL + '/patient/aligner/production/reminder/v1/delete'
export const URL_NOTE_ADD = BASE_APP_PATIENT_URL + '/patient/aligner/note/v1/'
export const URL_NOTE_UPDATE = BASE_APP_PATIENT_URL + '/patient/aligner/note/v1/update'
export const URL_NOTE_DELETE = BASE_APP_PATIENT_URL + '/patient/aligner/note/v1/delete'

// Other APIs
export const URL_GET_USER_TRACK_DETAIL = 'https://ipapi.co/json/'
export const URL_GET_PRODUCTION_ORDERS =
  BASE_APP_PATIENT_URL + '/patient/aligner/production/v2/orders'

// Leads Overview
export const URL_PATIENT_DELETE = BASE_APP_PATIENT_URL + '/patient/profile/v1/delete/'
export const URL_STATUS_CHANGE = BASE_APP_PATIENT_URL + '/patient/lead/v1/status/change'
export const URL_GET_LEADS_OVERVIEW = BASE_APP_PATIENT_URL + '/patient/lead/v1/profile/overview/'
export const URL_GET_LEADS_OVERVIEW_GETTING_STARTED =
  BASE_APP_PATIENT_URL + '/patient/v2/getting/started/'
export const URL_LEADS_OVERVIEW_GETTING_STARTED_MARK_READ =
  BASE_APP_PATIENT_URL + '/patient/v2/mark/as/read'
export const URL_ASSIGN_PRACTICE = BASE_APP_PATIENT_URL + '/patient/practice/v1/'

//Leads profile
export const URL_GET_LEADS_PROFILE_DETAILS = BASE_APP_PATIENT_URL + '/patient/v2/overview/details'
export const URL_GET_ACTIVE_PRACTICES =
  BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/active-or-pending'
export const URL_GET_ACTIVE_VENDORS = BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/received'

export const URL_UPDATE_LEADS_PROFILE_DETAILS = BASE_APP_PATIENT_URL + '/patient/lead/v1/update'
export const URL_GET_CASE_INFORMATION = BASE_APP_PATIENT_URL + '/patient/case/info/v1/'
export const URL_ADD_CASE_INFORMATION = BASE_APP_PATIENT_URL + '/patient/case/info/v1/'

export const URL_ACTIVITY_COMMENT =
  BASE_APP_PATIENT_URL + '/patient/workflow/activities/get/comments-and-activities'

// Files and Folders
export const URL_GET_FILES = BASE_APP_PATIENT_URL + '/patient/files/v1/'
export const URL_CREATE_FOLDER = BASE_APP_PATIENT_URL + '/patient/files/v1/folder'
export const URL_RENAME_FILE_OR_FOLDER = BASE_APP_PATIENT_URL + '/patient/files/v1/rename'
export const URL_UPLOAD_FILES = BASE_APP_PATIENT_URL + '/patient/files/v1/files'
export const URL_DELETE_FILES = BASE_APP_PATIENT_URL + '/patient/files/v1/files/delete'
export const URL_DOWNLOAD_FILES = BASE_APP_PATIENT_URL + '/patient/files/v1/download'
export const URL_MOVE_FILES = BASE_APP_PATIENT_URL + '/patient/files/v1/files/move'

//b2b setup treatment plan
export const URL_GET_TREATMENT_PLAN = BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/plan/'
export const URL_GET_TREATMENT_PLAN_LIST = BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/plan'
export const URL_GET_ALL_TREATMENT_PLAN_LIST =
  BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/braces-aligner'
export const URL_CREATE_TREATMENT_PLAN = BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/plan'
export const URL_DEACTIVATE_TREATMENT_PLAN = BASE_APP_PATIENT_URL + '/patient/aligner/v2/deactivate'
export const URL_POST_DELETE_DRAFT =
  BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/plan/delete?profileId='
export const URL_GET_BRACES_TREATMENT_PLAN_LIST = BASE_APP_PATIENT_URL + '/patient/braces/v1/filter'
export const URL_GET_BRACES_TREATMENT_PLAN_DETAIL = BASE_APP_PATIENT_URL + '/patient/braces/v1/'
export const URL_GET_BRACKET_TYPE_LIST = BASE_APP_PATIENT_URL + '/patient/braces/bracket/v1/'
export const URL_GET_BRACKET_SELECT_TYPE_LIST =
  BASE_APP_PATIENT_URL + '/patient/braces/bracket/v1/bracket-type/'
export const URL_GET_BRACKET_SUB_TYPE_LIST =
  BASE_APP_PATIENT_URL + '/patient/braces/bracket/v1/bracket-sub-type/'
export const URL_GET_BRACKET_COMPANY_LIST =
  BASE_APP_PATIENT_URL + '/patient/braces/bracket/v1/bracket-company/'
export const URL_GET_ANCHOR_TYPE_LIST =
  BASE_APP_PATIENT_URL + '/patient/treatment/plan/type/v1/anchor/'
export const URL_POST_ANCHOR_TYPE = BASE_APP_PATIENT_URL + '/patient/treatment/plan/type/v1/anchor'
export const URL_POST_BRACKET_ADD_COMPANY = BASE_APP_PATIENT_URL + '/patient/braces/bracket/v1/add'
export const URL_POST_CREATE_TREATMENT_PLAN_BRACES = BASE_APP_PATIENT_URL + '/patient/braces/v1'
export const URL_POST_UPDATE_TREATMENT_PLAN_BRACES =
  BASE_APP_PATIENT_URL + '/patient/braces/v1/update'
export const URL_POST_COMPLETE_TREATMENT =
  BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/complete-treatment'

// Tracking
export const URL_GET_TRACKING_DETAILS = BASE_APP_PATIENT_URL + '/patient/leads/tracking/v1'
export const URL_POST_TRACKING_DETAILS = BASE_APP_PATIENT_URL + '/patient/aligner/v2'

// Leads Add Treatment
export const URL_GET_LEAD_TREATMENT_LIST = BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/'

// Action list
export const URL_FORCE_ALIGNER_CHANGE = BASE_APP_PATIENT_URL + '/patient/aligner/v2/change/aligner'

// Leads Aligner Tracking
export const URL_PAUSE_OR_RESUME_TREATMENT =
  BASE_APP_PATIENT_URL + '/patient/aligner/v2/pause-or-resume'
export const URL_GET_RESUME_TREATMENT_DETAILS =
  BASE_APP_PATIENT_URL + '/patient/aligner/v2/treatment/details/'
export const URL_GET_ALIGNER_UPDATES = BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/all/'
export const URL_GET_ALIGNER_UPDATE_DETAILS = BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/'
export const URL_VALIDATE_AND_APPROVE_ALIGNER =
  BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/validate'
export const URL_SEND_COMMENT = BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/comment'
export const URL_MOVE_TO_PREVIOUS_ALIGNER =
  BASE_APP_PATIENT_URL + '/patient/aligner/v1/change/aligner/previous'

//Global Search
export const URL_GLOBAL_SEARCH = BASE_APP_PATIENT_URL + '/patient/global/search/v2/search'

//Appointments
export const URL_BRACES_PATIENT_LIST = BASE_APP_PATIENT_URL + '/patient/braces/v1/'
export const URL_BRACES_TREATMENT_LIST = BASE_APP_PATIENT_URL + '/patient/braces/v1/filter'
export const URL_REMINDER_LIST = BASE_APP_PATIENT_URL + '/patient/appointment/reminder/v1/'
export const URL_BRACES_NOTES_LIST = BASE_APP_PATIENT_URL + '/patient/appointment/v1'
export const URL_DELETE_BRACES_REMINDER =
  BASE_APP_PATIENT_URL + '/patient/appointment/reminder/v1/delete/'
export const URL_ADD_BRACES_REMINDER = BASE_APP_PATIENT_URL + '/patient/appointment/reminder/v1/'
export const URL_DELETE_BRACES_APPOINTMENT = BASE_APP_PATIENT_URL + '/patient/appointment/v1/'

// Add Appointment
export const URL_BRACES_TREATMENT_STAGE_LIST =
  BASE_APP_PATIENT_URL + '/patient/material/v1/treatment/stage'
export const URL_BRACES_TREATMENT_MATERIAL_SHAPE_LIST =
  BASE_APP_PATIENT_URL + '/patient/material/v1/by-treatment-stage/'
export const URL_BRACES_TREATMENT_MATERIAL_NAME_LIST =
  BASE_APP_PATIENT_URL + '/patient/material/v1/material/'
export const URL_BRACES_TREATMENT_MATERIAL_SIZE_LIST =
  BASE_APP_PATIENT_URL + '/patient/material/v1/material/sizes/'
export const URL_SPACE_CLOSURE_TOOL_LIST = BASE_APP_PATIENT_URL + '/patient/material/v1/tool/'
export const URL_ADD_MATERIAL_NAME = BASE_APP_PATIENT_URL + '/patient/material/v1/add'
export const URL_ADD_MATERIAL_SIZE = BASE_APP_PATIENT_URL + '/patient/material/v1/add/sizes'
export const URL_ADD_SPACE_AND_CLOSURE =
  BASE_APP_PATIENT_URL + '/patient/material/v1/add/material/tool'
export const URL_ADD_ACCESSORIES = BASE_APP_PATIENT_URL + '/patient/material/v1/add/material/tool'
export const URL_GET_APPOINTMENT_BY_APPOINTMENT_ID =
  BASE_APP_PATIENT_URL + '/patient/appointment/v1/'
export const URL_ADD_APPOINTMENT = BASE_APP_PATIENT_URL + '/patient/appointment/v1/create'
export const URL_UPDATE_APPOINTMENT = BASE_APP_PATIENT_URL + '/patient/appointment/v1/update'
export const URL_ADD_PHOTOS_FOR_APPOINTMENT =
  BASE_APP_PATIENT_URL + '/patient/appointment/v1/files/'

// Dashboard
export const URL_DASHBOARD_COUNTS_LIST =
  BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v2/get/count/'
export const URL_DASHBOARD_PENDING_PATIENTS =
  BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v2/pending/action'

export const URL_DASHBOARD_THINGS_TO_DO_PATIENTS =
  BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/details'
export const URL_DASHBOARD_DISMISS_EVENT =
  BASE_APP_PATIENT_URL + '/patient/aligner/action/v1/actions/inactivate'
export const URL_DASHBOARD_UPCOMING_ALIGNER =
  BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v1/upcoming/aligner/change/'
export const URL_DASHBOARD_ORDER_COUNTS_LIST =
  BASE_APP_PATIENT_URL + '/patient/order/v1/orders-count?doctorId='
export const URL_DASHBOARD_DATA = BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v3/'
export const URL_DASHBOARD_NEW_DATA = BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v4/'

//subscription
export const URL_GET_SUBSCRIPTION = BASE_APP_PATIENT_URL + '/patient/subscription/v1/details/'
export const URL_MANAGE_SUBSCRIPTION = BASE_APP_PATIENT_URL + '/patient/chargebee/v1/portal-session'
export const URL_UPDATE_SUBSCRIPTION_FLAGS = BASE_APP_PATIENT_URL + '/patient/subscription/v1/flag'
export const URL_REQUEST_EXTENSION =
  BASE_APP_PATIENT_URL + '/patient/chargebee/v1/extend/subscription'
export const URL_UPGRADE_PLAN = BASE_APP_PATIENT_URL + '/patient/subscription/v1/update-flag/'

// Payments
export const URL_GET_PAYMENT_DETAIL = BASE_APP_PATIENT_URL + '/patient/payments/v1/payments/from/'
export const URL_POST_TREATMENT_COST = BASE_APP_PATIENT_URL + '/patient/payments/v1/treatment/cost'
export const URL_POST_ADD_PAYMENT = BASE_APP_PATIENT_URL + '/patient/payments/v1/payment'
export const URL_POST_UPDATE_PAYMENT = BASE_APP_PATIENT_URL + '/patient/payments/v1/payment/update'
export const URL_POST_DELETE_PAYMENT = BASE_APP_PATIENT_URL + '/patient/payments/v1/payment/delete'

// Payment Reminder
export const URL_ADD_PAYMENT_REMINDER = BASE_APP_PATIENT_URL + '/patient/payments/reminder/v1'
export const URL_UPDATE_PAYMENT_REMINDER =
  BASE_APP_PATIENT_URL + '/patient/payments/reminder/v1/update'
export const URL_DELETE_PAYMENT_REMINDER =
  BASE_APP_PATIENT_URL + '/patient/payments/reminder/v1/delete'

//Calendar
export const URL_GET_ALL_PATIENTS = BASE_APP_PATIENT_URL + '/patient/v2/all'
export const URL_GET_EVENTS_FOR_DATE_RANGE = BASE_APP_PATIENT_URL + '/patient/calendar/v3/reminders'
export const URL_ADD_REMINDER_EVENT = BASE_APP_PATIENT_URL + '/patient/reminder/v1'
export const URL_UPDATE_REMINDER_EVENT = BASE_APP_PATIENT_URL + '/patient/reminder/v1/update'
export const URL_DELETE_REMINDER_EVENT = BASE_APP_PATIENT_URL + '/patient/reminder/v1/delete'
export const URL_ADD_APPOINTMENT_EVENT =
  BASE_APP_PATIENT_URL + '/patient/custom/appointment/reminder/v1'
export const URL_UPDATE_APPOINTMENT_EVENT =
  BASE_APP_PATIENT_URL + '/patient/custom/appointment/reminder/v1/update'
export const URL_DELETE_APPOINTMENT_EVENT =
  BASE_APP_PATIENT_URL + '/patient/custom/appointment/reminder/v1/delete'
export const URL_APPOINTMENTS_LIST =
  BASE_APP_PATIENT_URL + '/patient/custom/appointment/reminder/v1/appointments'

//Notes
export const URL_ADD_NOTES = BASE_APP_PATIENT_URL + '/patient/notes/v1/'
export const URL_GET_PROFILE_NOTES = BASE_APP_PATIENT_URL + '/patient/notes/v1/profile/'
export const URL_UPDATE_NOTES = BASE_APP_PATIENT_URL + '/patient/notes/v1/'
export const URL_DELETE_NOTES = BASE_APP_PATIENT_URL + '/patient/notes/v1/'

// Summary
export const URL_SUMMARY = BASE_APP_PATIENT_URL + '/patient/summary/v1/'

//Billings and payments
export const GET_BILLINGS_AND_PAYMENTS_DATA = BASE_APP_PATIENT_URL + '/patient/payments/v1/filter'

//settings
export const URL_GET_ACCOUNT_DETAILS = BASE_APP_DOCTOR_URL + '/doctor/account/v1/'
export const URL_POST_ACCOUNT_DETAILS = BASE_APP_DOCTOR_URL + '/doctor/account/v2/update'
export const URL_POST_BILLING_DETAILS = BASE_APP_DOCTOR_URL + '/doctor/billing/v2/'
export const URL_GET_BILLING_DETAILS = BASE_APP_DOCTOR_URL + '/doctor/billing/v1/'
export const URL_GET_PROFILE_DETAILS =
  BASE_APP_DOCTOR_URL + '/doctor/profile/management/v1/details/'
export const URL_MARK_PROFILE_AS_DEFAULT =
  BASE_APP_DOCTOR_URL + '/doctor/profile/management/v1/mark-as-default'
export const URL_UPGRADE_RENEWAL_SUBSCRIPTION =
  BASE_APP_PATIENT_URL + '/patient/subscription/v1/account-upgrade'
export const URL_DELETE_ACCOUNT =
  BASE_APP_PATIENT_URL + '/patient/doctor/v1/deactivate/subscription'

// practices
export const URL_ADD_OR_EDIT_PRACTICES = BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/'
export const URL_LIST_PRACTICES = BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/active-or-pending'

//orders
export const URL_ORDER_STATUS_UPDATE = BASE_APP_PATIENT_URL + '/patient/order/v1'
export const URL_CLONE_ORDER = BASE_APP_PATIENT_URL + '/patient/order/v1/clone-order'
export const URL_CLONE_ORDER_V2 = BASE_APP_PATIENT_URL + '/patient/order/v2/clone-order'
export const URL_GET_ORDER_DETAILS = BASE_APP_PATIENT_URL + '/patient/order/v1/get-order'
export const URL_VALIDATE_PATIENT =
  BASE_APP_PATIENT_URL + '/patient/new/invitation/v1/validate-patient'
export const URL_CREATE_ORDER = BASE_APP_PATIENT_URL + '/patient/order/v1'
export const URL_CREATE_ORDER_V2 = BASE_APP_PATIENT_URL + '/patient/order/v2'
export const URL_VSP_ORDERS = BASE_APP_PATIENT_URL + '/patient/v1/vsp/orders'
export const URL_VSP_CASE_RECORDS = BASE_APP_PATIENT_URL + '/patient/v1/vsp/case-records'
export const URL_VSP_PRESCRIPTIONS = BASE_APP_PATIENT_URL + '/patient/v1/vsp/prescriptions'
export const URL_VSP_MINI_DASHBOARD = BASE_APP_PATIENT_URL + '/patient/v1/vsp/mini-dashboard'
export const URL_VSP_DEFAULT_SHIPPING_ADDRESS =
  BASE_APP_PATIENT_URL + '/patient/vsp/v1/shipping/default'
export const URL_VSP_SHIPPING_DETAILS = BASE_APP_PATIENT_URL + '/patient/vsp/v1/shipping'
export const URL_ADD_VSP_SHIPPING_DETAILS = BASE_APP_PATIENT_URL + '/patient/vsp/v1/shipping/create'

export const URL_VSP_DEFAULT_BILLING_ADDRESS =
  BASE_APP_PATIENT_URL + '/patient/vsp/v1/billing/default'
export const URL_VSP_ORDER_CASE_RECORDS =
  BASE_APP_PATIENT_URL + '/patient/v1/vsp/orders/case-records'
export const URL_VSP_ORDER_PRESCRIPTIONS =
  BASE_APP_PATIENT_URL + '/patient/v1/vsp/orders/prescriptions'
export const URL_ADD_ORDER_TIMELINE_COMMENT =
  BASE_APP_PATIENT_URL + '/patient/order/v1/add-timeline-comments'
export const URL_GET_ORDER_TIMELINE_COMMENTS =
  BASE_APP_PATIENT_URL + '/patient/order/v1/get-timeline-comments'
export const URL_GET_ORDER_DETAILS_LIST =
  BASE_APP_PATIENT_URL + '/patient/order/v1/patients-order-detail'
export const URL_GET_UNPROCESSED_ORDER_DETAILS_LIST =
  BASE_APP_PATIENT_URL + '/patient/unprocessed-aligner/v1/'

export const URL_POST_SMILE_SIMULATION = BASE_SMILE_SIMULATION + '/v1/simulated-outcome/'
export const URL_ADD_PROFILE = BASE_APP_DOCTOR_URL + '/doctor/v1/create-profile'
export const URL_DEACTIVATE_USER_LINK = BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/deactivate'
export const URL_PATIENTS_LIST = BASE_APP_PATIENT_URL + '/patient/list/v1/all'
export const URL_PATIENTS_LIST_FOR_ORG = BASE_APP_PATIENT_URL + '/patient/list/v3/'
export const URL_PATIENTS_COUNT_LIST = BASE_APP_PATIENT_URL + '/patient/list/v1/all/count/'
export const URL_CUSTOMER_PATIENTS_LIST =
  BASE_APP_PATIENT_URL + '/patient/list/v3/customer-patients'
export const URL_PATIENTS_LIST_V3_CASES = BASE_APP_PATIENT_URL + '/patient/list/v3/cases'

export const URL_GET_PATIENT_TASK_TRACKER_CANCELLED =
  BASE_APP_PATIENT_URL + '/patient/task-tracker/get/patient-task-tracker/filter-by-cancelled'

// Kanban Counts
export const URL_GET_KANBAN_COUNTS = BASE_APP_PATIENT_URL + '/patient/task-tracker/kanban-counts/'

export const URL_USERS_LIST_MAIN =
  BASE_APP_PATIENT_URL + '/patient/order/v1/users/orders-count?doctorId='

export const URL_SKIP_GETTING_STARTED_STEP =
  BASE_APP_PATIENT_URL + '/patient/getting/started/v1/skip'
export const URL_GETTING_STARTED = BASE_APP_PATIENT_URL + '/patient/getting/started/v1/details'

export const URL_ACCEPT_INVITE =
  BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/accept/without-profile'
export const URL_REJECT_INVITE = BASE_APP_DOCTOR_URL + '/doctor/invitation/v1/reject'
export const URL_ALIGNER_PATIENT_ANALYTICS_COUNT =
  BASE_APP_PATIENT_URL + '/patient/aligner/analytics/v1/chart-count'
export const URL_ALIGNER_PATIENT_ANALYTICS_LIST =
  BASE_APP_PATIENT_URL + '/patient/aligner/analytics/v1/'
export const URL_PATIENT_LIST_FOR_REMIND_ALL =
  BASE_APP_PATIENT_URL + '/patient/aligner/analytics/v1/for-remind-all'
export const URL_DASHBOARD_EDIT_LABELS =
  BASE_APP_PATIENT_URL + '/patient/dashboard/label/v1/create-or-update'
export const URL_PRACTICE_DASHBOARD_DATA =
  BASE_APP_PATIENT_URL + '/patient/order/v2/enterprise-dashboard'

// Patient Timeline
export const URL_GET_PATIENT_TIMELINE =
  BASE_APP_PATIENT_URL + '/patient/profile/overview/v1/actions'
export const URL_GET_PATIENT_TIMELINE_LIST =
  BASE_APP_PATIENT_URL + '/patient/profile/overview/v1/actions/list'

export const URL_ZIP_ORDER = BASE_APP_PATIENT_URL + '/patient/order/v1/dismiss-zip-file'

//Getting started Overview
export const URL_GETTING_STARTED_OVERVIEW =
  BASE_APP_PATIENT_URL + '/patient/getting-started/v2/details'

export const URL_CREATE_MANUFACTURING = BASE_APP_PATIENT_URL + '/patient/manufacturing/create'
export const URL_UPDATE_MANUFACTURING = BASE_APP_PATIENT_URL + '/patient/manufacturing/update'

export const URL_GET_MANUFACTURING = BASE_APP_PATIENT_URL + '/patient/manufacturing/'
export const URL_GET_MANUFACTURING_LIST = BASE_APP_PATIENT_URL + '/patient/manufacturing/list'

export const URL_COMPLETE_MANUFACTURING = BASE_APP_PATIENT_URL + '/patient/manufacturing/update'

export const URL_ADD_SHIPPING = BASE_APP_PATIENT_URL + '/patient/manufacturing/update/shipping'
//Case Records
export const URL_CREATE_CASE_RECORD = BASE_APP_PATIENT_URL + '/patient/case-record/v1/create'
export const URL_GET_CASE_RECORD = BASE_APP_PATIENT_URL + '/patient/case-record/v1/'
export const URL_GET_ALL_CASE_RECORD = BASE_APP_PATIENT_URL + '/patient/case-record/v1/all'
export const URL_GET_SINGLE_CASE_RECORD =
  BASE_APP_PATIENT_URL + '/patient/case-record/v1/case-record'
export const URL_DELETE_CASE_RECORD = BASE_APP_PATIENT_URL + '/patient/case-record/v1/delete'

// Add Prescription
export const URL_CREATE_PRESCRIPTION = BASE_APP_PATIENT_URL + '/patient/prescription/add'
export const URL_GET_PRESCRIPTION_BY_ID = BASE_APP_PATIENT_URL + '/patient/prescription/get'
export const URL_GET_PRESCRIPTION_BY_PATIENT =
  BASE_APP_PATIENT_URL + '/patient/prescription/get-by-patient'

export const URL_DELETE_PRESCRIPTION_BY_ID = BASE_APP_PATIENT_URL + '/patient/prescription/delete'
export const URL_UPDATE_PRESCRIPTION_BY_ID = BASE_APP_PATIENT_URL + '/patient/prescription/update'

export const URL_POST_DEFAULT_ADDRESS = BASE_APP_PATIENT_URL + '/patient/shipping/v1/'
export const URL_GET_DEFAULT_SHIPMENT_ADDRESS =
  BASE_APP_PATIENT_URL + '/patient/shipping/v1/get-default/'

export const URL_NEED_MORE_INFO =
  BASE_APP_PATIENT_URL + '/patient/order/v1/update-to-cancelled-or-need-more-info'
export const URL_CANCEL_ORDER =
  BASE_APP_PATIENT_URL + '/patient/order/v1/update-to-cancelled-or-need-more-info'

//Access Control
export const URL_ACCESS_CONTROL_USER_LIST =
  BASE_APP_PATIENT_URL + '/patient/access/control/v1/users'
export const URL_ADD_ACCESS_CONTROL_USER =
  BASE_APP_PATIENT_URL + '/patient/access/control/v1/custom-roles'
export const URL_INVITE_USERS = BASE_APP_PATIENT_URL + '/patient/doctor/invitation/v1/'
export const URL_AUDIT_LOGS = BASE_APP_PATIENT_URL + '/patient/v1/audit'
export const URL_GET_PERMISSION_DETAILS =
  BASE_APP_PATIENT_URL + '/patient/access/control/v1/sub-roles/'
export const URL_ADD_CUSTOM_ROLE = BASE_APP_PATIENT_URL + '/patient/access/control/v1/custom-roles'
export const URL_EDIT_CUSTOM_ROLE =
  BASE_APP_PATIENT_URL + '/patient/access/control/v1/edit/custom-roles'
export const URL_ROLES_OPTION_LIST =
  BASE_APP_PATIENT_URL + '/patient/access/control/v1/roles-and-permissions-minimal'

export const URL_GET_SERVICE_PERMISSIONS =
  BASE_APP_PATIENT_URL + '/patient/service-products/categories/profile/'
export const URL_GET_SERVICE_CONFIGURATION =
  BASE_APP_PATIENT_URL + '/patient/service-configuration/profile/'
export const URL_GET_SERVICE_ENABLE_DISABLE =
  BASE_APP_PATIENT_URL + '/patient/service-configuration/'
export const URL_GET_CATEGORY_LIST =
  BASE_APP_PATIENT_URL + '/patient/service-products/categories/profile/'
export const URL_UPDATE_SERVICE_TOGGLE = ''
export const URL_GET_WORKFLOW = BASE_APP_PATIENT_URL + '/patient/workflow-management/v1/workflows?'
export const URL_ADD_WORKFLOW_STATUS =
  BASE_APP_PATIENT_URL + '/patient/workflow-management/v1/workflows/'
export const URL_EDIT_WORKFLOW_STATUS =
  BASE_APP_PATIENT_URL + '/patient/workflow-management/v1/statuses/'
export const URL_UPDATE_WORKFLOW_STATUS_POSITIONS =
  BASE_APP_PATIENT_URL + '/patient/workflow-management/v1/statuses/'

export const URL_DELETE_WORKFLOW_STATUS =
  BASE_APP_PATIENT_URL + '/patient/workflow-management/v1/statuses'

export const URL_GET_KANBAN_TASK_LIST = BASE_APP_PATIENT_URL + '/patient/task-tracker/'
export const URL_MOVE_TASK_CARD = BASE_APP_PATIENT_URL + '/patient/task-tracker/move'
export const URL_UPDATE_TASK = BASE_APP_PATIENT_URL + '/patient/task-tracker/'

export const URL_MY_TASK_CREATION = BASE_APP_PATIENT_URL + '/patient/my-task/add'
export const URL_BATCHES_TASK_CREATION =
  BASE_APP_PATIENT_URL + '/patient/manufacturing-batch-checklist/create/multiple'
export const URL_GET_PRODUCTION_CHECKLIST_DATA =
  BASE_APP_PATIENT_URL + '/patient/manufacturing-batch-checklist/batch/'
export const URL_MY_TASK_UPDATE = BASE_APP_PATIENT_URL + '/patient/my-task/'
export const URL_MY_TASK_DELETE = BASE_APP_PATIENT_URL + '/patient/my-task/delete/'
export const URL_GET_MY_TASK_LIST = BASE_APP_PATIENT_URL + '/patient/my-task/get/all-task'

export const URL_GET_CARD_CONFIGURATION =
  BASE_APP_PATIENT_URL + '/patient/card-display-config/card-display-config/by-profile-id/'

export const URL_UPDATE_CARD_CONFIGURATION =
  BASE_APP_PATIENT_URL + '/patient/card-display-config/card-display-fields/'

export const URL_GET_LOGS = BASE_APP_PATIENT_URL + '/patient/workflow/activities/get/all'
export const URL_GET_CATEGORY =
  BASE_APP_PATIENT_URL + '/patient/service-products/categories/profile/'

export const URL_GET_SERVICE_PRODUCT =
  BASE_APP_PATIENT_URL + '/patient/service-products/products/category/'
export const URL_NEW_WORKFLOW =
  BASE_APP_PATIENT_URL + '/patient/workflow-management/v1/kanban-board'
export const URL_MOVE_WORKFLOW = BASE_APP_PATIENT_URL + '/patient/task-tracker/change-workflow'
export const URL_GET_PATIENT_TASK_TRACKER_FILTER =
  BASE_APP_PATIENT_URL + '/patient/task-tracker/get/patient-task-tracker/filter'
export const URL_ADD_COMMENT = BASE_APP_PATIENT_URL + '/patient/comment/v1/add'
export const URL_GET_COMMENT = BASE_APP_PATIENT_URL + '/patient/comment/v1/'
export const URL_GET_CUSTOMER_PRODUCTS =
  BASE_APP_PATIENT_URL + '/patient/service-products/customer/products'
export const URL_GET_CUSTOMER_PRODUCTS_V2 = BASE_APP_PATIENT_URL + '/patient/service-products/v2'
export const URL_REMOVE_ASSIGNED_SERVICE_PRODUCT =
  BASE_APP_PATIENT_URL + '/patient/service-products/assign/remove'

export const URL_NEW_PLAN_LIST = BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/plan/workflow'
export const URL_GET_PRODUCT = BASE_APP_PATIENT_URL + '/patient/service-products/products/filter'
export const URL_GET_ENABLED_PRODUCT = BASE_APP_PATIENT_URL + '/patient/service-products/v1'
export const URL_ASSIGN_SERVICE_PRODUCT = BASE_APP_PATIENT_URL + '/patient/service-products/assign'
export const URL_TOGGLE_SERVICE_PRODUCT = BASE_APP_PATIENT_URL + '/patient/service-products'
export const URL_ADD_SHIPPING_DETAILS = BASE_APP_PATIENT_URL + '/patient/shipping/v1/create'
export const URL_POST_ATTACH_SHIPPING =
  BASE_APP_PATIENT_URL + '/patient/leads/treatment/v1/attach-shipping'

export const URL_GET_PRODUCTION_DATA =
  BASE_APP_PATIENT_URL + '/patient/task-tracker/ongoing-production-list'
export const URL_MULTI_SELECT_STATUS =
  BASE_APP_PATIENT_URL + '/patient/task-tracker/move/multi-task'

export const URL_GET_PRODUCT_LIST =
  BASE_APP_PATIENT_URL + '/patient/service-products/products/profile/'
export const URL_GET_USER_TASK_DETAILS =
  BASE_APP_PATIENT_URL + '/patient/task-tracker/individual-patient'

export const URL_ADD_SERVICE_PRODUCT = BASE_APP_PATIENT_URL + '/patient/service-products'
export const URL_EDIT_SERVICE_PRODUCT = BASE_APP_PATIENT_URL + '/patient/service-products/products/'

export const URL_DELETE_PRODUCT_ITEM = BASE_APP_PATIENT_URL + '/patient/service-products/products/'
export const URL_UPDATE_INFO_STATUS = BASE_APP_PATIENT_URL + '/patient/flag/toggle'
export const URL_PATIENT_ORDER_LIST =
  BASE_APP_PATIENT_URL + '/patient/order/v2/patients-order-detail'
export const URL_CUSTOMER_ORDER_DETAIL =
  BASE_APP_PATIENT_URL + '/patient/order/v2/customer-order-detail'
export const URL_PATIENT_DOCTOR_MINI_DASHBOARD =
  BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v2/mini-dashboard'
export const URL_PATIENT_DOCTOR_MINI_DASHBOARD_V4 =
  BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v4/mini-dashboard'
export const URL_PATIENT_DOCTOR_MINI_DASHBOARD_CUSTOMER =
  BASE_APP_PATIENT_URL + '/patient/doctor/dashboard/v2/mini-dashboard/customer'
export const URL_TOGGLE_CUSTOMER_TRACKING =
  BASE_APP_PATIENT_URL + '/patient/leads/tracking/v1/toggle-is-tracking/'
export const URL_DOCTOR_TOGGLE_DETAILS =
  BASE_APP_PATIENT_URL + '/patient/leads/tracking/v1/toggle-details'

export const URL_DATA_MIGRATION_API =
  BASE_APP_PATIENT_URL + '/patient/drive/file-migration/profile/'
export const URL_DATA_MIGRATION_COUNTS =
  BASE_APP_PATIENT_URL + '/patient/drive/file-migration/profile/status/'

export const URL_REWARDS_DAILY = BASE_APP_PATIENT_URL + '/patient/v1/rewards/tasks'
export const URL_REWARDS_DAILY_UPDATE = BASE_APP_PATIENT_URL + '/patient/v1/rewards/tasks/'
export const URL_REWARDS_MILESTONES = BASE_APP_PATIENT_URL + '/doctor/rewards/v1/milestones'
export const URL_REWARDS_PRODUCTS = BASE_APP_PATIENT_URL + '/patient/v1/rewards/products'
export const URL_REWARDS_PROMOTIONS = BASE_APP_PATIENT_URL + '/patient/v1/rewards/promotions/'
export const URL_REWARDS_PROMOTIONS_CREATE =
  BASE_APP_PATIENT_URL + '/patient/v1/rewards/promotions/create'
export const URL_REWARDS_PROMOTIONS_GET_ALL =
  BASE_APP_PATIENT_URL + '/patient/v1/rewards/promotions/all'
export const URL_REWARDS_TASK_TOGGLE = (taskId: number) =>
  BASE_APP_PATIENT_URL + `/patient/v1/rewards/tasks/${taskId}/toggle`
export const URL_REWARDS_DASHBOARD = BASE_APP_PATIENT_URL + '/patient/v1/rewards/orders/dashboard'
export const URL_REWARDS_PATIENT_WALLET_ALL =
  BASE_APP_PATIENT_URL + '/patient/v1/patient/rewards/wallet/all'
export const URL_REWARDS_ORDERS_ALL = BASE_APP_PATIENT_URL + '/patient/v1/rewards/orders/all'
export const URL_REWARDS_PROMOTIONS_CLAIMS =
  BASE_APP_PATIENT_URL + '/patient/v1/rewards/promotions/claims'
export const URL_REWARDS_PROMOTIONS_VERIFY =
  BASE_APP_PATIENT_URL + '/patient/v1/rewards/promotions/verify'
export const URL_REWARDS_ORDERS_APPROVE =
  BASE_APP_PATIENT_URL + '/patient/v1/rewards/orders/approve'
export const URL_REWARDS_ORDERS_REJECT = BASE_APP_PATIENT_URL + '/patient/v1/rewards/orders/reject'

// CUSTOMER PATIENT  PROFILE
export const URL_CUSTOMER_PATIENT_PROFILE = BASE_APP_PATIENT_URL + '/patient/v3/'
export const URL_CUSTOMER_PATIENT_PROFILE_PLANNING_STEPS =
  BASE_APP_PATIENT_URL + '/patient/v3/current-step'
export const URL_VSP_PATIENT_DETAILS = BASE_APP_PATIENT_URL + '/patient/v1/vsp/patient-details'
export const URL_VSP_PATIENT_STEPPER = BASE_APP_PATIENT_URL + '/patient/v1/vsp/orders/'
export const URL_VSP_PRODUCTION = BASE_APP_PATIENT_URL + '/patient/vsp/production'
export const URL_VSP_PRODUCTION_ORDER = BASE_APP_PATIENT_URL + '/patient/vsp/production/order'
export const URL_VSP_PRODUCTION_SHIPPING = BASE_APP_PATIENT_URL + '/patient/vsp/production/shipping'
export const URL_VSP_PRODUCTION_STATUS = BASE_APP_PATIENT_URL + '/patient/vsp/production/status'
export const URL_GET_FOLDERS_STATUS =
  BASE_APP_PATIENT_URL + '/patient/files/v1/default-patient-folder/status/'
