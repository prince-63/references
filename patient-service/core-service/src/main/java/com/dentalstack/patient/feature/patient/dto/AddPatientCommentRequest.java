package com.dentalstack.patient.feature.patient.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AddPatientCommentRequest {
    private Long doctorId;
    private Long profileId;
    private String notes;
    private Long patientId;
    private String remark;
    private Long taskId;
}
