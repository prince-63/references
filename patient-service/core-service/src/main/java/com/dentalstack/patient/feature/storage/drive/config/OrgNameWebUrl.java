package com.dentalstack.patient.feature.storage.drive.config;

import com.dentalstack.patient.feature.notification.enums.OrgName;
import java.util.Map;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "google.drive.org-name")
public class OrgNameWebUrl {
    private Map<OrgName, String> prod;
    private Map<OrgName, String> stage;
}
