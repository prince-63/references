package com.dentalstack.auth.dto.deviceinfo;

import com.dentalstack.auth.entity.DeviceInfo;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeviceInfoDetails {
    @NotNull
    private String fingerprint;

    private String brand;
    private String deviceType;
    private String modelName;
    private String ip;
    private String mac;

    public static DeviceInfoDetails from(DeviceInfo deviceInfo) {
        return DeviceInfoDetails.builder()
                .fingerprint(deviceInfo.getFingerprint())
                .brand(deviceInfo.getBrand())
                .deviceType(deviceInfo.getDeviceType())
                .modelName(deviceInfo.getModelName())
                .ip(deviceInfo.getIp())
                .mac(deviceInfo.getMac())
                .build();
    }
}
