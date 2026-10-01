package com.dentalstack.patient.feature.braces.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateBracesJourneyRequest {

    private Long doctorId;
    private Long patientId;
    private ProductTypeName productTypeName;
    private int tentativeTreatmentDurationInMonths;
    private String bracketType;
    private String bracketSelectType;
    private String bracketSubType;
    private String bracketBrand;
    private List<String> teethExtraction;
    private String remarks;
    private TreatmentStage treatmentStage;
    private BracesTreatmentStage bracesTreatmentStage;
    private String treatmentName;
    private String upperJawAnchorTypeValue;
    private String lowerJawAnchorTypeValue;
    private LocalDate treatmentStartDate;
    private String extractionRemarks;
}
