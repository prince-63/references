package com.dentalstack.auth.entity;

import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "device_info")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class DeviceInfo extends BaseEntity {
    private String fingerprint;
    private String brand;
    private String deviceType;
    private String modelName;
    private String ip;
    private String mac;
    private boolean isActive;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "auth_id")
    private Auth auth;

    public static DeviceInfo from(DeviceInfoDetails deviceInfoDetails) {
        return DeviceInfo.builder()
                .fingerprint(deviceInfoDetails.getFingerprint())
                .brand(deviceInfoDetails.getBrand())
                .deviceType(deviceInfoDetails.getDeviceType())
                .modelName(deviceInfoDetails.getModelName())
                .ip(deviceInfoDetails.getIp())
                .mac(deviceInfoDetails.getMac())
                .isActive(true)
                .build();
    }

    public void update(DeviceInfoDetails deviceInfo) {
        this.fingerprint = deviceInfo.getFingerprint();
        this.deviceType = deviceInfo.getDeviceType();
        this.brand = deviceInfo.getBrand();
        this.modelName = deviceInfo.getModelName();
        this.ip = deviceInfo.getIp();
        this.mac = deviceInfo.getMac();
    }

    public boolean matches(DeviceInfoDetails deviceInfo) {
        if (fingerprint != null) {
            return this.fingerprint.equals(deviceInfo.getFingerprint());
        } else if (ip != null) {
            return this.ip.equals(deviceInfo.getIp());
        }

        return true;
    }
}
