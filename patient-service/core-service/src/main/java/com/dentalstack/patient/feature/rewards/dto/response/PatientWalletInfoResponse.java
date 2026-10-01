package com.dentalstack.patient.feature.rewards.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientWalletInfoResponse {
    private Long patientId;
    private String firstName;
    private String lastName;
    private String email;
    private String customerMappedId;
    private String uuid;
    private String profilePictureUrl;
    private Long profilePictureId;
    private BigDecimal coinsEarned;
    private BigDecimal coinsUsed;
}
