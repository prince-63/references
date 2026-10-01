package com.dentalstack.chat.config;

import com.dentalstack.chat.enums.OrgName;
import java.util.Map;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "whatsapp.api")
public class WhatsAppApiProperties {

    private Map<OrgName, String> key;
}
