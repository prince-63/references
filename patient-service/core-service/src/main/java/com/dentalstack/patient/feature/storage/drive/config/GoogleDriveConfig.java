package com.dentalstack.patient.feature.storage.drive.config;

import static com.google.api.services.drive.DriveScopes.*;

import com.dentalstack.patient.feature.storage.drive.repository.GoogleDriveTokenRepository;
import com.dentalstack.patient.feature.storage.drive.service.DatabaseDataStoreFactory;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.Duration;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class GoogleDriveConfig {

    private final GoogleDriveTokenRepository tokenRepository;

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final Set<String> SCOPES = Set.of(DRIVE);

    @Value("${google.drive.application.name}")
    private String applicationName;

    @Value("${google.drive.redirect.uri}")
    private String redirectUri;

    private static NetHttpTransport HTTP_TRANSPORT;

    private final Cache<Long, Drive> driveCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(5))
            .maximumSize(100)
            .build();

    private NetHttpTransport getHttpTransport() throws Exception {
        if (HTTP_TRANSPORT == null) {
            HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        }
        return HTTP_TRANSPORT;
    }

    public GoogleClientSecrets loadClientSecrets() throws IOException {
        try (InputStream in = new ClassPathResource("credentials.json").getInputStream()) {
            return GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));
        }
    }

    private GoogleAuthorizationCodeFlow getAuthFlow() throws Exception {
        return new GoogleAuthorizationCodeFlow.Builder(getHttpTransport(), JSON_FACTORY, loadClientSecrets(), SCOPES)
                .setDataStoreFactory(new DatabaseDataStoreFactory(tokenRepository))
                .setAccessType("offline")
                .build();
    }

    public Drive getDriveServiceForUser(Long userId) throws Exception {
        Drive cached = driveCache.getIfPresent(userId);
        if (cached != null) {
            return cached;
        }
        Credential credential = getAuthFlow().loadCredential(String.valueOf(userId));
        if (credential == null || credential.getRefreshToken() == null) {
            throw new IllegalStateException("No valid credentials found. User must authorize.");
        }
        Drive drive = new Drive.Builder(getHttpTransport(), JSON_FACTORY, credential)
                .setApplicationName(applicationName)
                .build();
        driveCache.put(userId, drive);
        return drive;
    }

    public Drive ensureValidDriveService(Long userId) throws Exception {
        return getDriveServiceForUser(userId);
    }

    public String getAuthorizationUrl(Long userId) throws Exception {
        GoogleAuthorizationCodeFlow flow = getAuthFlow();

        var url = flow.newAuthorizationUrl().setRedirectUri(redirectUri).setState(String.valueOf(userId));

        boolean hasCredentials = tokenRepository.existsByProfileId(userId);

        if (!hasCredentials) {
            url.set("prompt", "consent");
        }

        return url.build();
    }

    public void saveUserCredentials(Long userId, String code) throws Exception {
        GoogleAuthorizationCodeFlow flow = getAuthFlow();
        GoogleTokenResponse tokenResponse =
                flow.newTokenRequest(code).setRedirectUri(redirectUri).execute();
        flow.createAndStoreCredential(tokenResponse, String.valueOf(userId));

        driveCache.invalidate(userId);
    }
}
