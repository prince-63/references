package com.dentalstack.patient.feature.notification.service.impl;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.notification.service.SlackService;
import com.dentalstack.patient.feature.storage.migration.dto.MigrationStatus;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionAccountUpgradeRequestDTO;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.projection.UserProfileSummary;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
@Profile("prod | local")
public class SlackServiceImpl implements SlackService {

    @NotNull
    private static JSONObject getJsonObject(
            UserProfileSummary doctor, SubscriptionPlanDTO request, SubscriptionPlan oldSubscriptionPlan) {
        String channelName = "#prod-user-onboarding";

        String message = String.format(
                "Dr. %s has successfully upgraded to the new plan! :tada: \n"
                        + "Full Name: %s %s \n"
                        + "Email: %s \n"
                        + "Plan Name: %s \n"
                        + "Next Billing Date: %s \n"
                        + "Current Term Start: %s \n"
                        + "Current Term End: %s \n"
                        + "Status: %s \n"
                        + "Total Patients (Old -> New): %d -> %d \n"
                        + "Total Storage (GB) (Old -> New): %.2f -> %.2f \n",
                doctor.getFirstName(),
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getEmail() != null ? doctor.getEmail() : "N/A",
                request.getPlanMetadata().getPlanName(),
                formatDate(request.getPlanMetadata().getNextBillingAt()),
                formatDate(request.getPlanMetadata().getCurrentTermStart()),
                formatDate(request.getPlanMetadata().getCurrentTermEnd()),
                request.getPlanMetadata().getStatus(),
                oldSubscriptionPlan.getTotalPatients() != null ? oldSubscriptionPlan.getTotalPatients() : 0,
                request.getTotalPatients(),
                oldSubscriptionPlan.getTotalStorageGb() != null ? oldSubscriptionPlan.getTotalStorageGb() : 0.0,
                request.getTotalStorageGb());

        JSONObject payload = new JSONObject();
        payload.put("channel", channelName);
        payload.put("username", "dentalstack-bot");
        payload.put("text", message);
        payload.put("icon_emoji", ":robot_face:");
        return payload;
    }

    @Override
    public void sendPlanUpgradeRequestMessage(
            UserProfileSummary userProfile, SubscriptionAccountUpgradeRequestDTO request, String formattedPlanName) {

        String channelName = "#prod-user-onboarding";

        String requestTypeEmoji =
                request.getRequestType().equalsIgnoreCase("UPGRADE_PLAN") ? ":arrow_up:" : ":arrows_counterclockwise:";

        String message = String.format(
                "New Plan Change Request Received %s \n"
                        + "-------------------------\n"
                        + "*Doctor Information:*\n"
                        + "Name: %s %s\n"
                        + "Email: %s\n"
                        + "Phone: %s %s\n"
                        + "Profile ID: %d\n"
                        + "\n"
                        + "*Plan Details:*\n"
                        + "Request Type: %s\n"
                        + "Current Plan: %s\n"
                        + "New Plan: %s\n"
                        + "Current Plan Start: %s\n"
                        + "Current Plan End: %s\n"
                        + "\n"
                        + "*Additional Information:*\n"
                        + "Notes: %s\n",
                requestTypeEmoji,
                userProfile.getFirstName(),
                userProfile.getLastName(),
                userProfile.getEmail() != null ? userProfile.getEmail() : request.getUserEmail(),
                request.getCountryCode(),
                request.getMobile(),
                request.getProfileId(),
                formattedPlanName,
                formatPlanForDisplay(request.getCurrentPlanName()),
                formatPlanForDisplay(request.getNewPlanName()),
                formatDate(request.getCurrentPlanStartDate()),
                formatDate(request.getCurrentPlanEndDate()),
                request.getNotes() != null ? request.getNotes() : "No additional notes provided");

        JSONObject payload = new JSONObject();
        payload.put("channel", channelName);
        payload.put("username", "dentalstack-bot");
        payload.put("text", message);
        payload.put("icon_emoji", ":chart_with_upwards_trend:");

        sendSlackNotification(payload);
    }

    private void sendSlackNotification(JSONObject payload) {
        String slackWebhookUrl = "https://hooks.slack.com/services/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";

        try {
            URL url = new URL(slackWebhookUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = payload.toString().getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                log.error("Failed to send Slack notification: HTTP error code: {}", responseCode);
            } else {
                log.info("Successfully sent Slack notification for plan upgrade request");
            }

        } catch (Exception e) {
            log.error("Error sending Slack notification: {}", e.getMessage(), e);
        }
    }

    public String formatPlanForDisplay(String planName) {
        if (planName == null) return null;

        return switch (planName.toUpperCase()) {
            case "STARTER" -> "Starter Plan";
            case "GROWTH" -> "Growth Plan";
            case "PROFESSIONAL" -> "Professional Plan";
            case "DESIGN_LAB" -> "Design lab";
            default -> planName;
        };
    }

    private static String formatDate(TemporalAccessor date) {
        if (date == null) {
            return "Not Available :x:";
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM yyyy").withZone(ZoneId.systemDefault());
        return formatter.format(date);
    }

    @Override
    public void sendSubscriptionUpdateMessage(
            UserProfileSummary userProfileSummary, SubscriptionPlanDTO request, SubscriptionPlan subscriptionPlan) {
        String slackWebhookUrl = "https://hooks.slack.com/services/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";
        JSONObject payload = getJsonObject(userProfileSummary, request, subscriptionPlan);

        try {
            URL url = new URL(slackWebhookUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = payload.toString().getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new RuntimeException("Failed to send Slack notification: HTTP error code : " + responseCode);
            }

        } catch (Exception e) {
            System.err.println("Error sending Slack notification: " + e.getMessage());
        }
    }

    @Override
    public void sendSlackNotification(
            Doctor doctor, String planName, String userType, String roleName, UserProfile userProfile) {
        String slackWebhookUrl = "https://hooks.slack.com/services/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";
        JSONObject payload = getJsonObject(doctor, planName, userType, roleName, userProfile);

        try {
            URL url = new URL(slackWebhookUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = payload.toString().getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new RuntimeException("Failed to send Slack notification: HTTP error code : " + responseCode);
            }

        } catch (Exception e) {
            System.err.println("Error sending Slack notification: " + e.getMessage());
        }
    }

    @Override
    public void sendMigrationCompletionMessage(
            UserProfileSummary userProfileSummary, MigrationStatus migrationStatus, double progress) {
        String channelName = "#prod-user-onboarding";
        String message = String.format(
                "Google Drive file migration reached 100%%. :white_check_mark:\n"
                        + "*Profile ID:* %d\n"
                        + "*Doctor:* %s %s\n"
                        + "*Email:* %s\n"
                        + "*Total Active Files:* %d\n"
                        + "*Migrated Files:* %d\n"
                        + "*Remaining Files:* %d\n"
                        + "*Deleted Files:* %d\n"
                        + "*Progress:* %.2f%%\n"
                        + "*Status:* %s",
                migrationStatus.getProfileId(),
                userProfileSummary.getFirstName(),
                userProfileSummary.getLastName(),
                userProfileSummary.getEmail() != null ? userProfileSummary.getEmail() : "N/A",
                migrationStatus.getTotalFiles(),
                migrationStatus.getMigratedFiles(),
                migrationStatus.getRemainingFiles(),
                migrationStatus.getDeletedFiles(),
                progress,
                migrationStatus.getStatus());

        JSONObject payload = new JSONObject();
        payload.put("channel", channelName);
        payload.put("username", "dentalstack-bot");
        payload.put("text", message);
        payload.put("icon_emoji", ":file_folder:");
        sendSlackNotification(payload);
    }

    @NotNull
    private static JSONObject getJsonObject(
            Doctor doctor, String planName, String userType, String roleName, UserProfile userProfile) {
        String channelName = "#prod-user-onboarding";
        var orgName = userProfile.getOrganizationBrandName();
        String message = String.format(
                "Dr. %s has been successfully onboarded.. \n"
                        + "Org Name: %s \n"
                        + "FullName: %s %s \n"
                        + "Email: %s \n"
                        + "CountryCode: %s \n"
                        + "Mobile: %s \n"
                        + "Plan Name: %s \n"
                        + "User Type: %s \n"
                        + "Role Name: %s",
                doctor.getFirstName(),
                orgName != null ? orgName : "N/A",
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getEmail(),
                doctor.getCountryCode(),
                doctor.getMobile(),
                planName != null ? planName : "N/A",
                userType != null ? userType : "N/A",
                roleName != null ? roleName : "N/A");

        JSONObject payload = new JSONObject();
        payload.put("channel", channelName);
        payload.put("username", "dentalstack-bot");
        payload.put("text", message);
        payload.put("icon_emoji", ":robot_face:");

        JSONObject attachment = new JSONObject();
        attachment.put("fallback", "You are unable to deactivate this subscription");
        attachment.put("color", "#ff0000");
        attachment.put("pretext", "Need to deactivate this subscription?");

        JSONObject action = new JSONObject();
        action.put("type", "button");
        action.put("text", "Deactivate Subscription");
        action.put(
                "url",
                "https://patient.dental-stack.com/patient/subscription/v1/deactivate-subscription/" + doctor.getId());
        action.put("style", "danger");

        JSONArray actions = new JSONArray();
        actions.put(action);
        attachment.put("actions", actions);

        JSONArray attachments = new JSONArray();
        attachments.put(attachment);
        payload.put("attachments", attachments);

        return payload;
    }
}
