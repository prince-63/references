package com.dentalstack.patient.feature.smartbox.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartBoxRequest {
    private String patientId;
    private LocalDateTime lastSanitizedAt;
    private LocalDateTime lastSyncAt;
    private DeviceInfo deviceInfo;
    private Boolean isUpdate;
}
