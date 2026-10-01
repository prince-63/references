package com.dentalstack.chat.controller.v1.email.doctorinvitation;

import com.dentalstack.chat.dto.doctorinvitation.DoctorInvitationEmailRequest;
import com.dentalstack.chat.enums.invitation.DoctorRole;
import com.dentalstack.chat.enums.invitation.UserRegistrationType;
import com.dentalstack.chat.service.DoctorService;
import com.dentalstack.chat.service.email.EmailService;
import com.dentalstack.chat.util.ChatUtil;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/doctor/invitation/email/v1")
@RequiredArgsConstructor
@Slf4j
public class DoctorInvitationEmailController {

    @Value("${base_url}")
    private String baseUrl;

    @Value("${login_web_url}")
    private String loginWebUrl;

    @Value("${login_web_url_smilezy}")
    private String loginUrlSmilezy;

    @Value("${login_web_url_craft_align}")
    private String loginUrlCraftAlign;

    @Value("${login_web_url_route_to_smile}")
    private String loginUrlRouteToSmile;

    @Value("${login_web_url_route_to_smile_vsp}")
    private String loginUrlRouteToSmileVsp;

    @Value("${login_web_url_confident_aligner}")
    private String loginWebUrlConfidentAligner;

    @Value("${login_web_url_clear_castle}")
    private String loginWebUrlClearCastle;

    @Value("${login_web_url_smile_excel}")
    private String smileExcelWebLink;

    @Value("${login_web_url_synapse}")
    private String loginUrlSynapse;

    @Value("${login_web_url_aiiq_aligner}")
    private String aiiqAlignerWebLink;

    private final EmailService emailService;
    private final DoctorService doctorService;

    @PostMapping("/invite-practice")
    public void invitationMailToPractice(@Valid @RequestBody DoctorInvitationEmailRequest request) throws Exception {
        var orgName = mapOrgName(request.getOrgName());

        boolean isSecondaryAccount = ChatUtil.shouldUseSecondaryAccount(orgName);
        JSONObject mergeInfo = buildMergeInfo(request, orgName, true);
        String templateKey = "2518b.3f749558a9598172.k1.8202a3c0-1c5e-11f0-afd7-ae9c7e0b6a9f.196493a1ffc";

        JSONObject emailObject =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, orgName);
        emailService.sendEmail(emailObject, isSecondaryAccount);
    }

    @PostMapping("/invite-to-all")
    public void sendInvitationEmail(@Valid @RequestBody DoctorInvitationEmailRequest request) throws Exception {
        if (request.getRegistrationType() == UserRegistrationType.EXISTING_USER) {
            sendInvitationToExistingUser(request);
        } else {
            sendInvitationToNewUser(request);
        }
    }

    private void sendInvitationToExistingUser(DoctorInvitationEmailRequest request) throws Exception {
        var orgName = mapOrgName(request.getOrgName());

        JSONObject mergeInfo = new JSONObject()
                .put("sender_company_name", request.getSenderCompanyName())
                .put("receiver_user_name", request.getReceiverUserName())
                .put("invitation_portal_link", generateUrlForExistingUser(request.getDoctorRole(), orgName));

        String templateKey = "2518b.3f749558a9598172.k1.4154ba60-0bc5-11f0-b970-ae9c7e0b6a9f.195dc723906";

        boolean isSecondaryAccount = ChatUtil.shouldUseSecondaryAccount(orgName);
        JSONObject emailObject =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, orgName);
        emailService.sendEmail(emailObject, isSecondaryAccount);
    }

    private void sendInvitationToNewUser(DoctorInvitationEmailRequest request) throws Exception {
        String orgName = mapOrgName(request.getOrgName());
        JSONObject mergeInfo = new JSONObject()
                .put("sender_company_name", request.getSenderCompanyName())
                .put("receiver_user_name", request.getReceiverUserName())
                .put("unique_url", generateInviteUrl(orgName, request.getInviteCode()));

        String templateKey = "2518b.3f749558a9598172.k1.b567aa40-0bc8-11f0-b970-ae9c7e0b6a9f.195dc88dae4";

        boolean isSecondaryAccount = ChatUtil.shouldUseSecondaryAccount(orgName);
        JSONObject emailObject =
                emailService.createEmailJSONObject(request.getEmail(), mergeInfo, templateKey, orgName);
        emailService.sendEmail(emailObject, isSecondaryAccount);

        log.info("Invitation email sent to new user: {} with role: {}", request.getEmail(), request.getDoctorRole());
    }

    private String generateUrlForExistingUser(DoctorRole role, String orgName) {
        String path =
                switch (role) {
                    case IN_OFFICE_MANUFACTURER, ALIGNER_COMPANY_OR_LAB, CUSTOMER -> "/labs?invitation=true";
                    case VENDOR, COMMERCIAL_ALIGNER_LAB -> "/customers?invitation=true";
                    case INTERNAL_USER -> "/access-control/";
                    case CONSULTING_ORTHODONTIST -> "/access-control/labs"; // Added CONSULTING_ORTHODONTIST with path
                        // /access-control/labs
                    default -> throw new IllegalArgumentException("Unsupported doctor role: " + role);
                };

        return switch (orgName.toUpperCase()) {
            case "SMILEZY" -> loginUrlSmilezy + path;
            case "CRAFTALIGN" -> loginUrlCraftAlign + path;
            case "ROUTETOSMILE" -> loginUrlRouteToSmile + path;
            case "SYNAPSE" -> loginUrlSynapse + path;
            case "CLEARCASTLE" -> loginWebUrlClearCastle + path;
            case "SMILEXCEL" -> smileExcelWebLink + path;
            case "AIIQALIGNER" -> aiiqAlignerWebLink + path;
            case "CONFIDENTALIGNER" -> loginWebUrlConfidentAligner + path;
            case "ROUTETOSMILEVSP" -> loginUrlRouteToSmileVsp + path;
            default -> loginWebUrl + path;
        };
    }

    private String generateInviteUrl(String orgName, String inviteCode) {
        String url =
                switch (orgName.toUpperCase()) {
                    case "SMILEZY" -> loginUrlSmilezy;
                    case "CRAFTALIGN" -> loginUrlCraftAlign;
                    case "ROUTETOSMILE" -> loginUrlRouteToSmile;
                    case "SYNAPSE" -> loginUrlSynapse;
                    case "CLEARCASTLE" -> loginWebUrlClearCastle;
                    case "SMILEXCEL" -> smileExcelWebLink;
                    case "AIIQALIGNER" -> aiiqAlignerWebLink;
                    case "CONFIDENTALIGNER" -> loginWebUrlConfidentAligner;
                    case "ROUTETOSMILEVSP" -> loginUrlRouteToSmileVsp;

                    default -> loginWebUrl;
                };
        return url + "/" + inviteCode + "/connect";
    }

    private JSONObject buildMergeInfo(DoctorInvitationEmailRequest request, String orgName, boolean isPractice) {
        JSONObject mergeInfo = new JSONObject()
                .put("sender_company_name", request.getSenderCompanyName())
                .put("receiver_user_name", request.getReceiverUserName());

        if (isPractice) {
            mergeInfo.put("unique_url", generateInviteUrl(orgName, request.getInviteCode()));
        }

        return mergeInfo;
    }

    private String formatDateWithSuffix(LocalDate date) {
        String formattedDate = date.format(DateTimeFormatter.ofPattern("d MMM yyyy"));
        return formattedDate.replaceFirst("\\d+", addDaySuffix(date.getDayOfMonth()));
    }

    private String addDaySuffix(int day) {
        if (day >= 11 && day <= 13) {
            return day + "th";
        }

        return switch (day % 10) {
            case 1 -> day + "st";
            case 2 -> day + "nd";
            case 3 -> day + "rd";
            default -> day + "th";
        };
    }

    public static String mapOrgName(String brand) {
        if (!StringUtils.hasText(brand)) return "Dental Stack";
        return switch (brand.toUpperCase().trim()) {
            case "SMILEZY" -> "Smilezy";
            case "ALIGNEAZY" -> "Aligneazy";
            case "SMILECAPS" -> "Smilecaps";
            case "EVOLVALIGN" -> "Evolvalign";
            case "CRAFTALIGN" -> "Craftalign";
            case "ROUTETOSMILE" -> "RouteToSmile";
            case "ROUTETOSMILEVSP" -> "RouteToSmileVsp";
            case "CLEARCASTLE" -> "ClearCastle";
            case "SYNAPSE" -> "Synapse";
            case "AMEND" -> "Amend";
            case "SMILEXCEL" -> "SmilExcel";
            case "AIIQALIGNER" -> "AiiqAligner";
            case "CONFIDENTALIGNER" -> "ConfidentAligner";
            default -> "Dental Stack";
        };
    }
}
