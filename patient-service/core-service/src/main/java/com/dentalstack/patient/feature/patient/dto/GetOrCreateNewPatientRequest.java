package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetOrCreateNewPatientRequest {
    @NotNull
    private String mobileNo;

    @NotNull
    private CountryCode countryCode;
}
