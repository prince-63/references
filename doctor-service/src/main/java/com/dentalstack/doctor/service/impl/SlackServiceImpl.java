package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.service.SlackService;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.json.JSONObject;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
@Profile("prod")
public class SlackServiceImpl implements SlackService {

    @Override
    public void sendSlackNotification(Doctor doctor, boolean isNewDotor) {
        String slackWebhookUrl = "https://hooks.slack.com/services/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";
        JSONObject payload;
        if (isNewDotor) {
            payload = getJsonObject(doctor);
        } else {
            payload = existingUser(doctor);
        }
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

        } catch (Exception ignored) {
        }
    }

    @NotNull
    private static JSONObject getJsonObject(Doctor doctor) {
        String channelName = "#prod-user-onboarding";
        String message = String.format(
                "Dr. %s has been successfully onboarded.. \n"
                        + "FullName: %s %s \n"
                        + "Email: %s \n"
                        + "CountryCode: %s \n"
                        + "Mobile: %s",
                doctor.getFirstName(),
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getEmail(),
                doctor.getCountryCode(),
                doctor.getMobile());

        JSONObject payload = new JSONObject();
        payload.put("channel", channelName);
        payload.put("username", "dentalstack-bot");
        payload.put("text", message);
        payload.put("icon_emoji", ":robot_face:");
        return payload;
    }

    @NotNull
    private static JSONObject existingUser(Doctor doctor) {
        String channelName = "#prod-user-onboarding";
        String message = String.format(
                "An existing user has created a personal account. 🎉\n"
                        + "*Name:* Dr. %s %s\n"
                        + "*Email:* %s\n"
                        + "*Country Code:* %s\n"
                        + "*Mobile:* %s\n"
                        + "*Note:* This email was previously associated with an organization.",
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getEmail(),
                doctor.getCountryCode(),
                doctor.getMobile());

        JSONObject payload = new JSONObject();
        payload.put("channel", channelName);
        payload.put("username", "dentalstack-bot");
        payload.put("text", message);
        payload.put("icon_emoji", ":robot_face:");
        return payload;
    }
}
