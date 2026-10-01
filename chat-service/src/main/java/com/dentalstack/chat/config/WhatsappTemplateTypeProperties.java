package com.dentalstack.chat.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "whatsapp.template.type")
@Data
public class WhatsappTemplateTypeProperties {

    private String NEW_MESSAGE;
    private String VSP_CUSTOMER_INVITATION_SENT;
}
