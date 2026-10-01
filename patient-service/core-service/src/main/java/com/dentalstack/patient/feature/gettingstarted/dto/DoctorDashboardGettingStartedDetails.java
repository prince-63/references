package com.dentalstack.patient.feature.gettingstarted.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDashboardGettingStartedDetails {

    private boolean isPatientAdded;
    private boolean isPracticeLocationAdded;
    private boolean isUserAdded;
    private boolean isCustomerAdded;
    private boolean isBrandDetailsAdded;
    private boolean isCompanyDetailsAdded;
}
