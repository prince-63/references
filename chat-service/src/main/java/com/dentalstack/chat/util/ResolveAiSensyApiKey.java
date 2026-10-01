package com.dentalstack.chat.util;

import com.dentalstack.chat.config.WhatsAppApiProperties;
import com.dentalstack.chat.enums.OrgName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResolveAiSensyApiKey {

    private final WhatsAppApiProperties properties;

    public String resolve(OrgName orgName) {
        String apiKey = properties.getKey().get(orgName);
        if (apiKey == null) {
            throw new IllegalArgumentException("WhatsApp API key not configured for org: " + orgName);
        }
        return apiKey;
    }
}
