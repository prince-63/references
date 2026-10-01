package com.dentalstack.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableScheduling
@EnableCaching
public class ChatServiceApplication {

    public static void main(String[] args) {
        // Suppress AWS SDK v1 deprecation announcement (using v1 for S3 only)
        System.setProperty("aws.java.v1.disableDeprecationAnnouncement", "true");
        SpringApplication.run(ChatServiceApplication.class, args);
    }
}
