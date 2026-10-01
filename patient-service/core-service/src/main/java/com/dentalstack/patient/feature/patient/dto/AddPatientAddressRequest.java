package com.dentalstack.patient.feature.patient.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddPatientAddressRequest {
    private Long patientId;
    private List<AddressDetails> addresses;
}
