package com.dentalstack.patient.feature.storage.drive.config;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class RetryExecutor {

    private final int maxRetries;
    private final long initialBackoffMs;
    private final long maxBackoffMs;

    public RetryExecutor(int maxRetries, long initialBackoffMs, long maxBackoffMs) {
        this.maxRetries = maxRetries;
        this.initialBackoffMs = initialBackoffMs;
        this.maxBackoffMs = maxBackoffMs;
    }

    @FunctionalInterface
    public interface Retryable<T> {
        T execute() throws Exception;
    }

    public <T> T execute(String operationName, Retryable<T> action) throws Exception {
        int attempt = 0;
        long backoff = initialBackoffMs;

        while (true) {
            try {
                attempt++;
                return action.execute();
            } catch (Exception ex) {

                if (!isRetryable(ex) || attempt >= maxRetries) {
                    log.error("{} failed after {} attempts", operationName, attempt, ex);
                    throw ex;
                }

                log.warn(
                        "{} failed (attempt {}/{}). Retrying in {} ms. Cause: {}",
                        operationName,
                        attempt,
                        maxRetries,
                        backoff,
                        ex.getMessage());

                Thread.sleep(backoff);
                backoff = Math.min(backoff * 2, maxBackoffMs);
            }
        }
    }

    private boolean isRetryable(Exception ex) {
        if (ex instanceof IOException) {
            return true;
        }
        if (ex instanceof GoogleJsonResponseException gjre) {
            int status = gjre.getStatusCode();
            if (status == 429 || status >= 500) {
                return true;
            }
            if (status == 403 && gjre.getDetails() != null) {
                var errors = gjre.getDetails().getErrors();
                if (errors != null) {
                    for (var error : errors) {
                        String reason = error.getReason();
                        if (isRetryableReason(reason)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private boolean isRetryableReason(String reason) {
        return switch (reason) {
            case "rateLimitExceeded", "userRateLimitExceeded", "backendError", "internalError" -> true;
            default -> false;
        };
    }
}
