package com.dentalstack.patient.feature.smartbox.entity;

import com.dentalstack.patient.feature.smartbox.dto.DeviceInfo;
import com.dentalstack.patient.feature.smartbox.dto.SmartBoxRequest;
import com.dentalstack.patient.feature.smartbox.dto.SmartBoxResponse;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.*;

@Entity
@Table(name = "smart_box")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmartBox extends BaseEntity {

    private String patientId;

    private LocalDateTime lastSanitizedAt;

    private LocalDateTime lastSyncAt;

    private String deviceName;

    private String model;

    private String macAddress;

    private String hardwareVersion;

    private String firmware;

    private String manufacturer;

    private Boolean isSmartBoxEnable;

    public static SmartBoxResponse buildResponse(SmartBox smartBox) {
        return SmartBoxResponse.builder()
                .deviceInfo(DeviceInfo.builder()
                        .deviceName(smartBox.getDeviceName())
                        .model(smartBox.getModel())
                        .macAddress(smartBox.getMacAddress())
                        .hardwareVersion(smartBox.getHardwareVersion())
                        .firmware(smartBox.getFirmware())
                        .manufacturer(smartBox.getManufacturer())
                        .build())
                .isSmartBoxEnable(smartBox.getIsSmartBoxEnable())
                .patientId(smartBox.getPatientId())
                .lastSanitizedAt(smartBox.getLastSanitizedAt())
                .lastSyncAt(smartBox.getLastSyncAt())
                .build();
    }

    public static void setBasicFields(SmartBoxRequest request, SmartBox smartBox) {
        Optional.ofNullable(request.getPatientId()).ifPresent(smartBox::setPatientId);
        Optional.ofNullable(request.getLastSanitizedAt()).ifPresent(smartBox::setLastSanitizedAt);
        Optional.ofNullable(request.getLastSyncAt()).ifPresent(smartBox::setLastSyncAt);
    }

    public static void setDeviceInfoFields(SmartBoxRequest request, SmartBox smartBox) {
        if (request.getDeviceInfo() != null) {
            DeviceInfo deviceInfo = request.getDeviceInfo();
            Optional.ofNullable(deviceInfo.getDeviceName()).ifPresent(smartBox::setDeviceName);
            Optional.ofNullable(deviceInfo.getModel()).ifPresent(smartBox::setModel);
            Optional.ofNullable(deviceInfo.getMacAddress()).ifPresent(smartBox::setMacAddress);
            Optional.ofNullable(deviceInfo.getHardwareVersion()).ifPresent(smartBox::setHardwareVersion);
            Optional.ofNullable(deviceInfo.getFirmware()).ifPresent(smartBox::setFirmware);
            Optional.ofNullable(deviceInfo.getManufacturer()).ifPresent(smartBox::setManufacturer);
        }
    }
}
