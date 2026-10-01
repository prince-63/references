package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import lombok.Data;

@Data
public class UpdateStatusRequestDto {
    private String labelName;
    private String description;
    private String color;
}
