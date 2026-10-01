package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeletePatientCommentRequest {
    private Long doctorId;
    private Long profileId;
    private Long patientId;
    private Long commentId;
}
