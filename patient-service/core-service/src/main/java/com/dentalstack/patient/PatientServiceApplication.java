package com.dentalstack.patient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableScheduling
@EnableCaching
public class PatientServiceApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(PatientServiceApplication.class);
        app.setLazyInitialization(true);
        app.run(args);
    }
}
