package com.dental_stack.notification.client;

import com.dental_stack.application.DatabaseType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.feign.chat-service")
@Getter
@Setter
public class ChatServiceUrlConfig {

    private String dev;
    private String stage;
    private String prod;

    public String resolve(DatabaseType type) {
        return switch (type) {
            case DEV -> dev;
            case STAGE -> stage;
            case PROD -> prod;
        };
    }
}
