package com.dentalstack.patient.feature.app_dentals.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppDetailsRequest {
    private String oldAppName;
    private String newAppName;
    private String iosAppVersion;
    private String androidAppVersion;
}
