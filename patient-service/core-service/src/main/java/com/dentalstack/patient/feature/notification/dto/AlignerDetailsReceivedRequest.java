package com.dentalstack.patient.feature.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerDetailsReceivedRequest {
    private String doctorFirstName;
    private String doctorLastName;
    private String patientFirstName;
    private String doctorEmail;
    private Long patientId;
    private Long alignerJourneyId;
}
