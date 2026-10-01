package com.dentalstack.auth.dto.patient;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetOrCreateNewPatientRequest {
    private String mobileNo;
    private String countryCode;
}
