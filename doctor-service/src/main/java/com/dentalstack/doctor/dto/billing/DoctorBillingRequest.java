package com.dentalstack.doctor.dto.billing;

import com.dentalstack.doctor.enums.doctor.FileAction;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class DoctorBillingRequest {
    private long doctorId;
    private long organizationId;

    private Long billingId;

    private long profileId;
    // Note: profileId is a primitive long (always set). Validation is handled at service layer.

    private String companyLegalName;

    private String addressLine1;

    private String addressLine2;

    private String country;

    private String state;

    private String city;

    private String pincode;

    private String companyTaxId;

    private String currency;
    private String companyDisplayName;
    private FileAction fileAction;
    private FileAction fileBrandAction;
    private String companyBrandName;
}
