package com.dentalstack.patient.feature.rewards.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientRewardDashboardForDoctorResponse {

    private Long activePatient;
    private Long coinDistributed;
    private Long coinRedeemed;
}
