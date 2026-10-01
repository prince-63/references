package com.dentalstack.patient.feature.patient.dto;

import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePatientCommentRequest {
    private Long doctorId;
    private Long profileId;
    private String notes;
    private Long patientId;
    private String remark;
    private Long commentId;
    private Set<Long> fileIdsToRemove;
}
