package com.dentalstack.patient.feature.doctorinvitation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorInvitationCountDetails {

    private Long userCount;
    private Long invitedLabStaffCount;
    private Long activeLabStaffCount;

    private Long customerCount;
    private Long invitedCustomerCount;
    private Long activeCustomerCount;
    private boolean isBrandAndCompanyDetailsAdded;
    private Boolean isLabStaffDeactivated;
}
