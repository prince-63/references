package com.dentalstack.patient.feature.workflow.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityGetRequestDTO {
    private Long patientId;
    private Long profileId;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 20;
}
