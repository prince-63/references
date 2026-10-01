package com.dental_stack.files.migration.repository;

import com.dental_stack.files.migration.entity.GoogleDriveToken;
import com.google.api.client.auth.oauth2.StoredCredential;
import com.google.api.client.util.store.AbstractDataStore;
import com.google.api.client.util.store.DataStore;
import java.io.IOException;
import java.io.Serializable;
import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@SuppressWarnings("unchecked")
public class DatabaseDataStore<V extends Serializable> extends AbstractDataStore<V> {

    private final GoogleDriveTokenRepository tokenRepository;

    protected DatabaseDataStore(
            DatabaseDataStoreFactory dataStoreFactory,
            String id,
            GoogleDriveTokenRepository tokenRepository) {
        super(dataStoreFactory, id);
        this.tokenRepository = tokenRepository;
    }

    @Override
    public Set<String> keySet() {
        return tokenRepository.findAll().stream()
                .map(token -> token.getProfileId().toString())
                .collect(Collectors.toSet());
    }

    @Override
    public Collection<V> values() {
        return tokenRepository.findAll().stream()
                .map(this::convertToStoredCredential)
                .map(credential -> (V) credential)
                .collect(Collectors.toList());
    }

    @Override
    public V get(String key) {
        Long userId = parseUserId(key);
        Optional<GoogleDriveToken> token = tokenRepository.findByProfileId(userId);

        if (token.isEmpty()) return null;

        try {
            StoredCredential credential = convertToStoredCredential(token.get());
            return (V) credential;
        } catch (Exception e) {
            log.error("Error reading token for user {}: {}", key, e.getMessage());
            return null;
        }
    }

    @Override
    public DataStore<V> set(String key, V value) {
        validateInput(key, value);

        StoredCredential credential = (StoredCredential) value;
        Long userId = parseUserId(key);

        Optional<GoogleDriveToken> existingTokenOpt = tokenRepository.findByProfileId(userId);

        if (existingTokenOpt.isPresent()) {
            updateExistingToken(existingTokenOpt.get(), credential);
        } else {
            createNewToken(userId, credential);
        }
        return this;
    }

    @Override
    public DataStore<V> clear() throws IOException {
        tokenRepository.deleteAll();
        return this;
    }

    @Override
    public DataStore<V> delete(String key) {
        Long userId = parseUserId(key);
        tokenRepository.deleteByProfileId(userId);
        return this;
    }

    private StoredCredential convertToStoredCredential(GoogleDriveToken token) {
        return new StoredCredential()
                .setAccessToken(token.getAccessToken())
                .setRefreshToken(token.getRefreshToken())
                .setExpirationTimeMilliseconds(token.getExpiryDate().toEpochMilli());
    }

    private Long parseUserId(String key) {
        try {
            return Long.parseLong(key);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid user ID format: " + key, e);
        }
    }

    private void validateInput(String key, V value) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("Key cannot be null or empty");
        }
        if (value == null) {
            throw new IllegalArgumentException("Value cannot be null");
        }
        if (!(value instanceof StoredCredential)) {
            throw new IllegalArgumentException("Value must be instance of StoredCredential");
        }
    }

    private void updateExistingToken(GoogleDriveToken existingToken, StoredCredential credential) {
        if (credential.getAccessToken() != null) {
            existingToken.setAccessToken(credential.getAccessToken());
        }
        if (credential.getRefreshToken() != null) {
            existingToken.setRefreshToken(credential.getRefreshToken());
        }
        if (credential.getExpirationTimeMilliseconds() != null) {
            existingToken.setExpiryDate(
                    Instant.ofEpochMilli(credential.getExpirationTimeMilliseconds()));
        }
        tokenRepository.save(existingToken);
    }

    private void createNewToken(Long userId, StoredCredential credential) {
        if (credential.getAccessToken() == null
                || credential.getExpirationTimeMilliseconds() == null) {
            throw new IllegalArgumentException(
                    "Access token and expiration time are required for new tokens");
        }

        if (credential.getRefreshToken() == null) {
            log.warn(
                    "WARNING: Creating token for user {} without refresh token! User will need to re-authenticate when access token expires.",
                    userId);
        } else {
            log.info("Creating new token with refresh token for user {}", userId);
        }

        GoogleDriveToken newToken =
                GoogleDriveToken.builder()
                        .profileId(userId)
                        .accessToken(credential.getAccessToken())
                        .refreshToken(credential.getRefreshToken())
                        .expiryDate(
                                Instant.ofEpochMilli(credential.getExpirationTimeMilliseconds()))
                        .build();
        tokenRepository.save(newToken);
        log.info("Token saved successfully for user {}", userId);
    }
}
