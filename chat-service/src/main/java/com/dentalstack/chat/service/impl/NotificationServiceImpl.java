package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.dto.notification.*;
import com.dentalstack.chat.entity.WebNotification;
import com.dentalstack.chat.entity.notificationlog.PushNotificationLog;
import com.dentalstack.chat.repository.NotificationRepository;
import com.dentalstack.chat.repository.notificationlog.PushNotificationLogRepository;
import com.dentalstack.chat.service.NotificationService;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.validation.Valid;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final String SCOPES = "https://www.googleapis.com/auth/cloud-platform";
    private static final String PATIENT_APP_CREDENTIALS_PATH =
            "src/main/resources/dentalstack-b31ed-firebase-adminsdk-xozmq-78f558f3c5.json";
    private static final String DOCTOR_APP_CREDENTIALS_PATH =
            "src/main/resources/dentalstack-doctor-mobile-app-firebase-adminsdk-g1vpc-b6fd9de6a4.json";

    private final NotificationRepository notificationRepository;
    private final AndroidPushNotificationsService androidPushNotificationsService;
    private final PushNotificationLogRepository pushNotificationLogRepository;

    @Override
    public ResponseEntity<String> sendNotification(
            String message,
            String mobile,
            String title,
            int notificationIndex,
            Boolean isDoctorApp,
            Long patientId,
            String email,
            Long alignerJourneyId,
            Long alignerActionId,
            String globalId,
            String serviceName,
            String doctorRole,
            String xOrgName,
            Long organizationId)
            throws IOException {
        if (email == null) {
            return ResponseEntity.badRequest().body("Email cannot be null");
        }

        String topic = Base64.getUrlEncoder().withoutPadding().encodeToString(email.getBytes(StandardCharsets.UTF_8))
                + "_" + organizationId;
        Map<String, Object> messageMap = createMessageMap(
                topic,
                title,
                message,
                notificationIndex,
                patientId,
                alignerJourneyId,
                alignerActionId,
                globalId,
                serviceName,
                doctorRole,
                xOrgName,
                organizationId);

        HttpEntity<Map<String, Object>> request = getMapHttpEntity(isDoctorApp, messageMap);

        PushNotificationLog notificationLog = PushNotificationLog.builder()
                .email(email)
                .title(title)
                .message(message)
                .topic(topic)
                .build();

        try {
            ResponseEntity<String> response = sendPushNotification(request, isDoctorApp);
            notificationLog.setStatus(PushNotificationLog.Status.SENT);

            if (notificationIndex != 999) {
                pushNotificationLogRepository.save(notificationLog);
            }

            return response;
        } catch (Exception e) {
            log.error("Error while sending push notification", e);
            notificationLog.setStatus(PushNotificationLog.Status.FAILED);
            if (notificationIndex != 999) {
                pushNotificationLogRepository.save(notificationLog);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send notification: " + e.getMessage());
        }
    }

    private Map<String, Object> createMessageMap(
            String topic,
            String title,
            String message,
            int notificationIndex,
            Long patientId,
            Long alignerJourneyId,
            Long alignerActionId,
            String globalId,
            String serviceName,
            String doctorRole,
            String xOrgName,
            Long organizationId) {

        // Check for null values before converting them to String
        String patientIdStr = (patientId != null) ? Long.toString(patientId) : "null";
        String alignerJourneyIdStr = (alignerJourneyId != null) ? Long.toString(alignerJourneyId) : "null";
        String alignerActionIdStr = (alignerActionId != null) ? Long.toString(alignerActionId) : "null";
        String globalIdStr = (globalId != null) ? globalId : "null";
        String serviceNameStr = (serviceName != null) ? serviceName : "null";
        String doctorRoleStr = (doctorRole != null) ? doctorRole : "null";
        String organizationIdStr = (organizationId != null) ? Long.toString(organizationId) : "null";
        String xOrgNameStr = (xOrgName != null) ? xOrgName : "null";

        Map<String, String> dataMap = new HashMap<>();

        dataMap.put("notificationIndex", String.valueOf(notificationIndex));
        dataMap.put("title", title);
        dataMap.put("body", message);
        dataMap.put("patientId", patientIdStr);
        dataMap.put("alignerJourneyId", alignerJourneyIdStr);
        dataMap.put("alignerActionId", alignerActionIdStr);
        dataMap.put("globalId", globalIdStr);
        dataMap.put("serviceName", serviceNameStr);
        dataMap.put("doctorRole", doctorRoleStr);
        dataMap.put("xOrgName", xOrgNameStr);
        dataMap.put("organizationId", organizationIdStr);

        Map<String, String> android = Map.of("priority", "high");

        Map<String, Object> apnsMap;
        if (notificationIndex == 999) {
            apnsMap = Map.of(
                    "headers",
                            Map.of(
                                    "apns-priority", "5",
                                    "apns-push-type", "background"),
                    "payload", Map.of("aps", Map.of("content-available", 1, "sound", "")));
        } else {
            apnsMap = Map.of(
                    "headers",
                    Map.of(
                            "apns-priority", "10",
                            "apns-push-type", "alert"),
                    "payload",
                    Map.of("aps", Map.of("sound", "default", "content-available", 1)));
        }

        return Map.of(
                "topic", topic,
                "data", dataMap,
                "apns", apnsMap,
                "android", android);
    }

    private HttpEntity<Map<String, Object>> getMapHttpEntity(Boolean isDoctorApp, Map<String, Object> messageMap)
            throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.add(
                "Authorization",
                "Bearer " + (isDoctorApp != null && isDoctorApp ? getDoctorAppToken() : getPatientAppToken()));
        headers.add("Content-Type", MediaType.APPLICATION_JSON_VALUE);

        return new HttpEntity<>(Map.of("message", messageMap), headers);
    }

    private ResponseEntity<String> sendPushNotification(HttpEntity<Map<String, Object>> request, Boolean isDoctorApp)
            throws IOException {
        return androidPushNotificationsService
                .send(request, isDoctorApp)
                .thenApply(ResponseEntity::ok)
                .exceptionally(e -> {
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                    if (errorMsg.contains("Invalid registration token")) {
                        log.warn("FCM push skipped — device has an invalid/expired registration token");
                    } else if (errorMsg.contains("UNAVAILABLE") || errorMsg.contains("503")) {
                        log.warn(
                                "FCM push failed — Firebase service temporarily unavailable, will retry on next attempt");
                    } else {
                        log.error("Error while pushing notification to Firebase", e);
                    }
                    return ResponseEntity.badRequest().body("ERROR! Push Notification");
                })
                .join();
    }

    private String getPatientAppToken() throws IOException {
        return getToken(PATIENT_APP_CREDENTIALS_PATH);
    }

    private String getDoctorAppToken() throws IOException {
        return getToken(DOCTOR_APP_CREDENTIALS_PATH);
    }

    private String getToken(String credentialsPath) throws IOException {
        try (FileInputStream serviceAccount = new FileInputStream(credentialsPath)) {
            GoogleCredentials googleCredentials =
                    GoogleCredentials.fromStream(serviceAccount).createScoped(List.of(SCOPES));
            googleCredentials.refresh();
            return googleCredentials.getAccessToken().getTokenValue();
        }
    }

    @Override
    @Transactional
    public void createNotification(CreateNotification createNotification) {
        WebNotification webNotification = new WebNotification();

        webNotification.setNotificationBody(createNotification.getNotificationBody());
        webNotification.setNotificationTitle(createNotification.getNotificationTitle());
        webNotification.setDoctorId(createNotification.getDoctorId());
        webNotification.setActive(true);
        webNotification.setPatientId(createNotification.getPatientId());
        webNotification.setCreatedBy(createNotification.getDoctorUserId());

        notificationRepository.save(webNotification);
    }

    @Override
    public List<WebNotificationResponse> getNotificationList(Long doctorId) {
        return notificationRepository.findTop10ByDoctorIdAndActiveTrueOrderByCreatedAtDesc(doctorId).stream()
                .map(this::mapToWebNotificationResponse)
                .collect(Collectors.toList());
    }

    private WebNotificationResponse mapToWebNotificationResponse(WebNotification webNotification) {
        return WebNotificationResponse.builder()
                .body(webNotification.getNotificationBody())
                .title(webNotification.getNotificationTitle())
                .patientId(webNotification.getPatientId())
                .notificationId(webNotification.getId())
                .image("n/a")
                .build();
    }

    @Override
    @Transactional
    public void seenNotification(@Valid NotificationSeenRequest notificationSeenRequest) {
        notificationRepository
                .findAllById(notificationSeenRequest.getNotificationId())
                .forEach(notification -> notification.setActive(false));
    }
}
