package com.dental_stack.notification.client;

import com.dental_stack.application.DatabaseContextHolder;
import com.dental_stack.application.DatabaseType;
import feign.Feign;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatServiceClientFactory {

    private final Feign.Builder feignBuilder;
    private final ChatServiceUrlConfig urlConfig;

    public ChatServiceClient getClient() {

        DatabaseType type = DatabaseContextHolder.get();
        String baseUrl = urlConfig.resolve(type);

        return feignBuilder.target(ChatServiceClient.class, baseUrl);
    }
}
