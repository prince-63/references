package com.dentalstack.patient.feature.treatmenttracking.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class AlignerStageResponse {
    private Long id;
    private Integer alignerNumber;
    private String jawType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate changeDate;
    private String changeStatus;
    private Integer changeOffset;
    private Integer wearDays;
    private Integer extendedDays;
    private String status;
    private Boolean isCurrentAligner;
    private Boolean checkedIn;
    private Boolean issueReported;
}
