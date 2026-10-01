package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePatientAddressRequest {
    private Long patientId;
    private Long addressId;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String country;
    private Integer pincode;
}
