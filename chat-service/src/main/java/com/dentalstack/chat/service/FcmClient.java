package com.dentalstack.chat.service;

import com.dentalstack.chat.config.FcmSettings;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.TopicManagementResponse;
import com.google.firebase.messaging.WebpushConfig;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmClient {

    public FcmClient(FcmSettings settings) {
        Path p = Paths.get(settings.getServiceAccountFile());
        try (InputStream serviceAccount = Files.newInputStream(p)) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) { // <------- Here
                FirebaseApp.initializeApp(options);
            }

            // FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            log.error("init fcm", e);
        }
    }

    public String send(Notification notification, String topic) throws InterruptedException, ExecutionException {

        Message message = Message.builder()
                .setNotification(notification)
                .setTopic(topic)
                .setWebpushConfig(WebpushConfig.builder()
                        .putHeader("ttl", "300")
                        // .setNotification(new WebpushNotification("Background Title (server)",
                        //    "Background Body (server)"))
                        .build())
                .build();

        String response = FirebaseMessaging.getInstance().sendAsync(message).get();
        log.info(":: Sent message: " + response);
        return response;
    }

    public void subscribe(String topic, String clientToken) {
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                    .subscribeToTopicAsync(Collections.singletonList(clientToken), topic)
                    .get();
            log.info(response.getSuccessCount() + " tokens were subscribed successfully");
        } catch (InterruptedException | ExecutionException e) {
            log.error("subscribe", e);
        }
    }
}
