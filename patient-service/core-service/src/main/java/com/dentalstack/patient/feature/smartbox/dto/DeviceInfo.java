package com.dentalstack.patient.feature.smartbox.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceInfo {
    private String deviceName;
    private String model;
    private String macAddress;
    private String hardwareVersion;
    private String firmware;
    private String manufacturer;
}
