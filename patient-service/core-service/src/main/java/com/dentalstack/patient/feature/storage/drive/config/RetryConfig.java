package com.dentalstack.patient.feature.storage.drive.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RetryConfig {

    @Bean
    public RetryExecutor retryExecutor() {
        return new RetryExecutor(3, 1000, 8000);
    }
}
