package com.dentalstack.auth.dto.patient;

import com.dentalstack.auth.dto.JWTToken;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticatedPatient {
    private JWTToken token;
    private PatientDetails patientDetails;
    private boolean valid;
}
