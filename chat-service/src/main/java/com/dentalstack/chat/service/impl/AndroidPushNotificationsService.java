package com.dentalstack.chat.service.impl;

import com.google.auth.oauth2.GoogleCredentials;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AndroidPushNotificationsService {

    private static final String FIREBASE_API_URL_PATIENT_APP =
            "https://fcm.googleapis.com/v1/projects/dentalstack-b31ed/messages:send";
    private static final String FIREBASE_API_URL_DOCTOR_APP =
            "https://fcm.googleapis.com/v1/projects/dentalstack-doctor-mobile-app/messages:send";
    private static final String SCOPES = "https://www.googleapis.com/auth/cloud-platform";
    private static final String PATIENT_APP_CREDENTIALS_PATH =
            "src/main/resources/dentalstack-b31ed-firebase-adminsdk-xozmq-78f558f3c5.json";
    private static final String DOCTOR_APP_CREDENTIALS_PATH =
            "src/main/resources/dentalstack-doctor-mobile-app-firebase-adminsdk-g1vpc-b6fd9de6a4.json";

    private final RestTemplateBuilder restTemplateBuilder;

    @Async
    public CompletableFuture<String> send(HttpEntity<Map<String, Object>> entity, Boolean isDoctorApp) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String accessToken = isDoctorApp != null && isDoctorApp ? getDoctorAppToken() : getPatientAppToken();
                RestTemplate restTemplate = restTemplateBuilder.build();

                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(accessToken);
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(entity.getBody(), headers);

                String firebaseApiUrl =
                        isDoctorApp != null && isDoctorApp ? FIREBASE_API_URL_DOCTOR_APP : FIREBASE_API_URL_PATIENT_APP;

                return restTemplate.postForObject(firebaseApiUrl, request, String.class);
            } catch (IOException e) {
                log.error("Error sending notification", e);
                throw new RuntimeException("Failed to send notification", e);
            }
        });
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
}
