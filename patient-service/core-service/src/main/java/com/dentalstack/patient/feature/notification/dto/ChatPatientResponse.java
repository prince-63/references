package com.dentalstack.patient.feature.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatPatientResponse {

    private String profileImage;
    private Long patientId;
    private String firstName;
    private String lastName;
    private String mobile;
    private String email;
}
