package com.dentalstack.patient.feature.rewards.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientWalletInfoRequest {
    private Long userProfileId;
    private String searchText;
    private Integer page;
    private Integer size;
}
