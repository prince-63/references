package com.dentalstack.chat.controller.v1.email;

import static com.dentalstack.chat.util.ChatUtil.shouldUseSecondaryAccount;

import com.dentalstack.chat.dto.email.*;
import com.dentalstack.chat.dto.patient.PatientDetails;
import com.dentalstack.chat.dto.welcome.WelcomeEmailRequest;
import com.dentalstack.chat.enums.invitation.DoctorRole;
import com.dentalstack.chat.enums.template.EmailTemplate;
import com.dentalstack.chat.service.DoctorService;
import com.dentalstack.chat.service.PatientService;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.ChatUtil;
import com.dentalstack.chat.util.DateTimeUtils;
import jakarta.validation.Valid;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
@RequestMapping("/mail")
@RequiredArgsConstructor
@Slf4j
public class EmailSendController {

    @Value("${zepto-mail.api-url}")
    private String zeptoMailApiUrl;

    @Value("${zepto-mail.api-key}")
    private String zeptoMailApiKey;

    @Value("${login_web_url}")
    private String loginWebUrl;

    @Value("${login_web_url_craft_align}")
    private String loginWebUrlCraftAlign;

    @Value("${login_web_url_route_to_smile}")
    private String loginWebUrlRouteToSmile;

    @Value("${login_web_url_route_to_smile_vsp}")
    private String loginWebUrlRouteToSmileVsp;

    @Value("${login_web_url_clear_castle}")
    private String loginWebUrlClearCastle;

    @Value("${login_web_url_smilezy}")
    private String loginWebUrlSmilezy;

    @Value("${login_web_url_synapse}")
    private String loginWebUrlSynapse;

    @Value("${login_web_url_confident_aligner}")
    private String loginWebUrlConfidentAligner;

    @Value("${ios_app_url}")
    private String iosAppUrl;

    @Value("${android_app_url}")
    private String androidAppUrl;

    @Value("${base_url}")
    private String baseUrl;

    @Value("${smilezy_app_ios_link}")
    private String smileZyAppIosLink;

    @Value("${smilezy_app_android_link}")
    private String smileZyAppAndroidLink;

    @Value("${routetosmile_app_ios_link}")
    private String routeToSmileAppIosLink;

    @Value("${routetosmile_app_android_link}")
    private String routeToSmileAppAndroidLink;

    @Value("${clear_castle_app_android_link}")
    private String clearCastleAndroidAppLink;

    @Value("${clear_castle_app_ios_link}")
    private String clearCastleIosAppLink;

    @Value("${synapse_app_ios_link}")
    private String synapseAppIosLink;

    @Value("${synapse_app_android_link}")
    private String synapseAppAndroidLink;

    @Value("${login_web_url_smilezy}")
    private String smileZyWebLink;

    @Value("${login_web_url}")
    private String dentalStackWebLink;

    @Value("${ios_aligneazy}")
    private String iosAligneazy;

    @Value("${ios_evolvalign}")
    private String iosEvolvalign;

    @Value("${ios_smilecaps}")
    private String iosSmilecaps;

    @Value("${android_aligneazy}")
    private String androidAligneazy;

    @Value("${android_evolvalign}")
    private String androidEvolvalign;

    @Value("${android_amend}")
    private String androidAmend;

    @Value("${android_smile_excel}")
    private String androidSmilexcel;

    @Value("${android_aiiq_aligner}")
    private String androidAiiqAligner;

    @Value("${ios_amend}")
    private String iosAmend;

    @Value("${ios_smile_excel}")
    private String iosSmilexcel;

    @Value("${ios_aiiq_aligner}")
    private String iosAiiqAligner;

    @Value("${login_web_url_smile_excel}")
    private String smileExcelWebLink;

    @Value("${login_web_url_aiiq_aligner}")
    private String aiiqAlignerWebLink;

    @Value("${login_web_url}")
    private String inviteLandingPageUrl;

    @Value("${login_web_url_smilezy}")
    private String inviteLandingPageUrlSmilezy;

    @Value("${zepto-mail-secondary.api.url}")
    private String zeptoMailSecondaryApiUrl;

    @Value("${zepto-mail-secondary.api.key}")
    private String zeptoMailSecondaryApiKey;

    private final DoctorService doctorService;
    private final PatientService patientService;
    private final EmailService emailService;
    private WebClient webClient;

    private PatientDetails getPatientByEmail(String email) {
        return patientService.getPatientByEmail(email);
    }

    @PostMapping("/welcome")
    public String sendWelcomeMailToUser(@Valid @RequestBody WelcomeEmailRequest request) throws Exception {
        JSONObject mergeInfo = prepareMergeInfo(request);

        String orgName = ChatUtil.mapOrgName(request.getOrgName());
        String templateKey;
        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);
        try {
            templateKey = getTemplateKey(request.getDoctorRole());
        } catch (Exception e) {
            return "Invalid doctor role: " + request.getDoctorRole();
        }
        switch (orgName) {
            case "Smilezy":
                mergeInfo.put("doctor's_portal_url", loginWebUrlSmilezy);
                mergeInfo.put("doctor's_portal_url", loginWebUrlSmilezy);
                mergeInfo.put("google_play_store", smileZyAppAndroidLink);
                mergeInfo.put("apple_play_store", smileZyAppIosLink);
                break;
            case "Aligneazy":
                mergeInfo.put("doctor's_portal_url", loginWebUrl);
                mergeInfo.put("google_play_store", androidAligneazy);
                mergeInfo.put("apple_play_store", iosAligneazy);
            case "Evolvalign":
                mergeInfo.put("doctor's_portal_url", loginWebUrl);
                mergeInfo.put("google_play_store", androidEvolvalign);
                mergeInfo.put("apple_play_store", iosEvolvalign);
                break;
            case "Dental Stack":
                mergeInfo.put("doctor's_portal_url", loginWebUrl);
                mergeInfo.put("google_play_store", androidAppUrl);
                mergeInfo.put("apple_play_store", iosAppUrl);
                break;
            case "Smilecaps":
                mergeInfo.put("doctor's_portal_url", loginWebUrl);
                mergeInfo.put("google_play_store", androidAppUrl);
                mergeInfo.put("apple_play_store", iosSmilecaps);
                break;
            case "Craftalign":
                mergeInfo.put("doctor's_portal_url", loginWebUrlCraftAlign);
                mergeInfo.put("google_play_store", androidAppUrl);
                mergeInfo.put("apple_play_store", iosSmilecaps);
                break;
            case "RouteToSmile":
                mergeInfo.put("doctor's_portal_url", loginWebUrlRouteToSmile);
                mergeInfo.put("google_play_store", routeToSmileAppAndroidLink);
                mergeInfo.put("apple_play_store", routeToSmileAppIosLink);
                break;
            case "RouteToSmileVsp":
                mergeInfo.put("doctor's_portal_url", loginWebUrlRouteToSmileVsp);
                mergeInfo.put("google_play_store", routeToSmileAppAndroidLink);
                mergeInfo.put("apple_play_store", routeToSmileAppIosLink);
                break;
            case "Synapse":
                mergeInfo.put("doctor's_portal_url", loginWebUrlSynapse);
                mergeInfo.put("google_play_store", synapseAppAndroidLink);
                mergeInfo.put("apple_play_store", synapseAppIosLink);
                break;
            case "ClearCastle":
                mergeInfo.put("doctor's_portal_url", loginWebUrlClearCastle);
                mergeInfo.put("google_play_store", clearCastleAndroidAppLink);
                mergeInfo.put("apple_play_store", clearCastleIosAppLink);
                break;
            case "Amend":
                mergeInfo.put("doctor's_portal_url", loginWebUrl);
                mergeInfo.put("google_play_store", androidAmend);
                mergeInfo.put("apple_play_store", iosAmend);
                break;
            case "SmilExcel":
                mergeInfo.put("doctor's_portal_url", smileExcelWebLink);
                mergeInfo.put("google_play_store", androidSmilexcel);
                mergeInfo.put("apple_play_store", iosSmilexcel);
                break;
            case "AiiqAligner":
                mergeInfo.put("doctor's_portal_url", aiiqAlignerWebLink);
                mergeInfo.put("google_play_store", androidAiiqAligner);
                mergeInfo.put("apple_play_store", iosAiiqAligner);
                break;
            case "ConfidentAligner":
                mergeInfo.put("doctor's_portal_url", loginWebUrlConfidentAligner);
                mergeInfo.put("google_play_store", androidAppUrl);
                mergeInfo.put("apple_play_store", iosAppUrl);
            default:
                break;
        }

        JSONObject emailObject =
                emailService.createEmailJSONObject(request.getDoctorEmail(), mergeInfo, templateKey, orgName);
        return emailService.sendEmail(emailObject, isSecondaryAccount);
    }

    private JSONObject prepareMergeInfo(WelcomeEmailRequest request) {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("user_first_name", request.getDoctorFirstName());
        mergeInfo.put("trial_plan_name", request.getTrialPlanName());
        mergeInfo.put("trial_duration", request.getTrialDuration());
        mergeInfo.put("trial_storage", request.getTrialStorage());
        mergeInfo.put(
                "trial_expiry_date",
                request.getTrialExpiryDate() != null
                        ? DateTimeUtils.formatZonedDateWithSuffix(request.getTrialExpiryDate())
                        : null);
        mergeInfo.put("parameter1_value", request.getTotalValue());
        mergeInfo.put("user_email_id", request.getDoctorEmail());
        mergeInfo.put("company_name", request.getCompanyName());

        return mergeInfo;
    }

    private String getTemplateKey(DoctorRole doctorRole) {
        return switch (doctorRole) {
            case CONSULTING_ORTHODONTIST -> EmailTemplate.WELCOME_STARTER_DENTAL_STACK.getTemplateKey();
            case IN_OFFICE_MANUFACTURER -> EmailTemplate.WELCOME_GROWTH_DENTAL_STACK.getTemplateKey();
            case ALIGNER_COMPANY_OR_LAB, ENTERPRISE_COMPANY_LAB -> EmailTemplate.WELCOME_PROFESSIONAL_DENTAL_STACK
                    .getTemplateKey();
            case COMMERCIAL_ALIGNER_LAB -> EmailTemplate.WELCOME_DESIGN_LAB_DENTAL_STACK.getTemplateKey();
            case PRACTICE, LAB_STAFF -> EmailTemplate.WELCOME_THIRD_PARTY_CUSTOMER_DENTAL_STACK.getTemplateKey();
            case VENDOR -> EmailTemplate.WELCOME_THIRD_PARTY_LAB_DENTAL_STACK.getTemplateKey();
            default -> throw new IllegalArgumentException("Invalid doctor role: " + doctorRole);
        };
    }

    @PostMapping("/otp-send-on-email")
    public String sendOtpOnMail(@Valid @RequestBody OtpSendOnEmailRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        mergeInfo.put("unique_otp", request.getOtpNo());

        String orgName = Optional.ofNullable(request.getOrgName())
                .map(ChatUtil::mapOrgName)
                .orElse("");

        String templateKey = EmailTemplate.OTP_SEND.getTemplateKey();

        boolean isSecondaryAccount = shouldUseSecondaryAccount(orgName);

        JSONObject object = emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, orgName);

        return emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/otp-send-on-email-patient")
    public String sendOtpOnMailToPatient(@Valid @RequestBody OtpSendOnEmailRequest request) throws Exception {
        var patient = getPatientByEmail(request.getEmail());

        JSONObject mergeInfo = new JSONObject().put("unique_otp", request.getOtpNo());

        Optional.ofNullable(patient)
                .map(PatientDetails::getFirstName)
                .ifPresent(firstName -> mergeInfo.put("patient_first_name", firstName));

        String templateKey;
        String requestOrgName = Optional.ofNullable(request.getOrgName()).orElse("");

        templateKey = EmailTemplate.OTP_SEND.getTemplateKey();

        String patientOrgName =
                Optional.ofNullable(patient).map(PatientDetails::getOrgName).orElse("Dental Stack");

        boolean isDefaultOrg = "Dental Stack".equals(patientOrgName);

        JSONObject emailRequest = isDefaultOrg
                ? emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, requestOrgName)
                : emailService.createEmailJSONObjectForSpecificOrgName(
                        request.getEmail(), mergeInfo, templateKey, ChatUtil.mapOrgName(requestOrgName));

        boolean isSecondaryAccount = shouldUseSecondaryAccount(requestOrgName);

        return emailService.sendEmail(emailRequest, isSecondaryAccount);
    }

    @PostMapping("/password-reset-confirmation")
    public String sendPasswordResetConfirmationMail(@Valid @RequestBody EmailSendReq emailSendReq) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        var doctorDetails = doctorService.getDoctor(
                emailSendReq.getDoctorEmail(), emailSendReq.getOrganizationId(), emailSendReq.getXOrgName());

        mergeInfo.put(
                "user_first_name",
                doctorDetails.getSalutation() != null
                        ? doctorDetails.getSalutation() + ". " + emailSendReq.getDoctorFirstName()
                        : emailSendReq.getDoctorFirstName());

        String templateKey = EmailTemplate.PASSWORD_RESET_CONFIRMATION.getTemplateKey();

        JSONObject object = emailService.createEmailJSONObject(
                emailSendReq.getDoctorEmail(), mergeInfo, templateKey, emailSendReq.getOrgName());
        boolean isSecondaryAccount = shouldUseSecondaryAccount(emailSendReq.getOrgName());

        return emailService.sendEmail(object, isSecondaryAccount);
    }

    @PostMapping("/patient-password-reset-confirmation")
    public String sendPasswordResetConfirmationMailToPatient(@Valid @RequestBody EmailSendReq emailSendReq) {
        String patientEmail = emailSendReq.getDoctorEmail();
        var patient = patientService.getPatientByEmail(patientEmail);

        String templateKey = EmailTemplate.PASSWORD_RESET_CONFIRMATION.getTemplateKey();

        JSONObject mergeInfo = new JSONObject();
        if (patient != null) {
            mergeInfo.put("user_first_name", patient.getFirstName());
        }

        boolean isSecondaryAccount = shouldUseSecondaryAccount(emailSendReq.getOrgName());

        JSONObject emailRequest = emailService.createEmailJSONObject(
                patientEmail, mergeInfo, templateKey, emailSendReq.getOrgName().trim());
        return emailService.sendEmail(emailRequest, isSecondaryAccount);
    }

    @PostMapping("/patient/send-invitation")
    public void sendInvitation(@Valid @RequestBody InvitationRequest request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        var patient = getPatientByEmail(request.getPatientEmail());
        mergeInfo.put("user_name", request.getDoctorName());
        mergeInfo.put("patient_first_name", request.getPatientName());
        mergeInfo.put("patient_email", request.getPatientEmail());

        String templateKey = EmailTemplate.INVITATION_ENGLISH.getTemplateKey();

        var orgName = request.getOrgName();
        orgName = ChatUtil.mapOrgName(request.getOrgName());

        switch (orgName) {
            case "Dental Stack":
                mergeInfo.put("google_play_store", androidAppUrl);
                mergeInfo.put("apple_play_store", iosAppUrl);
                break;
            case "Aligneazy":
                mergeInfo.put("google_play_store", androidAligneazy);
                mergeInfo.put("apple_play_store", iosAligneazy);
                break;
            case "Evolvalign":
                mergeInfo.put("google_play_store", androidEvolvalign);
                mergeInfo.put("apple_play_store", iosEvolvalign);
                break;
            case "Smilecaps":
                mergeInfo.put("google_play_store", androidAppUrl);
                mergeInfo.put("apple_play_store", iosSmilecaps);
                break;
            case "Smilezy":
                mergeInfo.put("google_play_store", smileZyAppAndroidLink);
                mergeInfo.put("apple_play_store", smileZyAppIosLink);
                break;
            case "RouteToSmile":
                mergeInfo.put("google_play_store", routeToSmileAppAndroidLink);
                mergeInfo.put("apple_play_store", routeToSmileAppIosLink);
                break;
            case "Synapse":
                mergeInfo.put("google_play_store", synapseAppAndroidLink);
                mergeInfo.put("apple_play_store", synapseAppIosLink);
                break;
            case "ClearCastle":
                mergeInfo.put("google_play_store", clearCastleAndroidAppLink);
                mergeInfo.put("apple_play_store", clearCastleIosAppLink);
                break;
            case "Amend":
                mergeInfo.put("google_play_store", androidAmend);
                mergeInfo.put("apple_play_store", iosAmend);
                break;
            case "SmilExcel":
                mergeInfo.put("google_play_store", androidSmilexcel);
                mergeInfo.put("apple_play_store", iosSmilexcel);
                break;
            case "AiiqAligner":
                mergeInfo.put("google_play_store", androidAiiqAligner);
                mergeInfo.put("apple_play_store", iosAiiqAligner);
                break;
            case "ConfidentAligner":
                mergeInfo.put("google_play_store", androidAppUrl);
                mergeInfo.put("apple_play_store", iosAppUrl);
                break;
            default:
                break;
        }

        JSONObject object;

        if (patient == null
                || request.getOrgName() == null
                || request.getOrgName().equals("Dental Stack")) {
            object = emailService.createEmailJSONObject(request.getPatientEmail(), mergeInfo, templateKey, orgName);
        } else {
            object = emailService.createEmailJSONObjectForSpecificOrgName(
                    request.getPatientEmail(), mergeInfo, templateKey, orgName);
        }
        emailService.sendEmail(object);
    }

    @PostMapping("/invitation-accepted")
    public void invitationAccepted(@Valid @RequestBody EmailSendReq request) throws Exception {
        JSONObject mergeInfo = new JSONObject();
        var doctorDetails = doctorService.getDoctor(request.getDoctorEmail());
        var orgName = request.getOrgName();
        orgName = ChatUtil.mapOrgName(request.getOrgName());
        mergeInfo.put(
                "user_first_name",
                request.getSalutation() != null
                        ? request.getSalutation() + " " + request.getDoctorFirstName()
                        : doctorDetails.getFirstName());
        mergeInfo.put("patient_first_name", request.getPatientFirstName().trim());

        String patientProfileOverviewPage;
        if (orgName.equalsIgnoreCase("Smilezy")) {
            patientProfileOverviewPage = smileZyWebLink + "/profile/" + request.getPatientId();
        } else if (orgName.equalsIgnoreCase("CraftAlign")) {
            patientProfileOverviewPage = loginWebUrlCraftAlign + "/profile/" + request.getPatientId();
        } else if (orgName.equalsIgnoreCase("RouteToSmile")) {
            patientProfileOverviewPage = loginWebUrlRouteToSmile + "/profile/" + request.getPatientId();
        } else if (orgName.equalsIgnoreCase("Synapse")) {
            patientProfileOverviewPage = loginWebUrlSynapse + "/profile/" + request.getPatientId();
        } else if (orgName.equalsIgnoreCase("ClearCastle")) {
            patientProfileOverviewPage = loginWebUrlClearCastle + "/profile/" + request.getPatientId();
        } else if (orgName.equalsIgnoreCase("SmilExcel")) {
            patientProfileOverviewPage = smileExcelWebLink + "/profile/" + request.getPatientId();
        } else if (orgName.equalsIgnoreCase("AiiqAligner")) {
            patientProfileOverviewPage = aiiqAlignerWebLink + "/profile/" + request.getPatientId();
        } else if (orgName.equalsIgnoreCase("ConfidentAligner")) {
            patientProfileOverviewPage = loginWebUrlConfidentAligner + "/profile/" + request.getPatientId();
        } else {
            patientProfileOverviewPage = dentalStackWebLink + "/profile/" + request.getPatientId();
        }
        mergeInfo.put("doctor's_portal_url", patientProfileOverviewPage);
        String templateKey = EmailTemplate.INVITATION_ACCEPTED.getTemplateKey();
        JSONObject object =
                emailService.createEmailJSONObject(request.getDoctorEmail(), mergeInfo, templateKey, orgName);

        emailService.sendEmail(object);
    }

    @PostMapping("/new-patient-assigned-to-practice")
    public void newPatientAssignedToPractice(@Valid @RequestBody EmailSendReq request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        // Removing trailing spaces from each string value
        mergeInfo.put("company_name", request.getOrderReceiverName());
        mergeInfo.put("patient_name", request.getPatientFirstName().trim());

        String templateKey = "2518b.3f749558a9598172.k1.23f62f20-1c60-11f0-afd7-ae9c7e0b6a9f.1964944d312";
        JSONObject object = emailService.createEmailJSONObject(
                request.getDoctorEmail(), mergeInfo, templateKey, request.getOrgName());

        emailService.sendEmail(object);
    }

    @PostMapping("/added-patient-by-practice-mail")
    public void addedPatientByPracticeMail(@Valid @RequestBody EmailSendReq request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("practice_user_name", request.getName().trim());
        mergeInfo.put("patient_name", request.getPatientFirstName().trim());

        mergeInfo.put("date_added", ChatUtil.formatDateWithSuffix(request.getDate()));
        String templateKey = "2518b.3f749558a9598172.k1.c67bfa50-1c5f-11f0-afd7-ae9c7e0b6a9f.19649426e75";
        JSONObject object = emailService.createEmailJSONObject(
                request.getDoctorEmail(), mergeInfo, templateKey, request.getOrgName());

        emailService.sendEmail(object);
    }

    @PostMapping("/scheduled-maintenance")
    public void scheduledMaintenance(@Valid @RequestBody EmailSendReq request) throws Exception {
        JSONObject mergeInfo = new JSONObject();

        mergeInfo.put("maintenance_date", ChatUtil.formatDateWithSuffix(request.getDate()));
        mergeInfo.put("start_time", ChatUtil.formatTimeWithZone(request.getStartTime()));
        mergeInfo.put("end_time", ChatUtil.formatTimeWithZone(request.getEndTime()));

        String templateKey = EmailTemplate.SCHEDULED_MAINTENANCE.getTemplateKey();

        JSONObject object = emailService.createEmailJSONObject(
                request.getDoctorEmail(), mergeInfo, templateKey, request.getOrgName());
        boolean isSecondaryAccount = shouldUseSecondaryAccount(request.getOrgName());

        emailService.sendEmail(object, isSecondaryAccount);
    }
}
