package com.dentalstack.patient.feature.braces.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateBracesJourneyRequest {

    private Long bracesJourneyId;
    private Long doctorId;
    private Long patientId;
    private int tentativeTreatmentDurationInMonths;
    private String bracketType;
    private String bracketSelectType;
    private String bracketSubType;
    private String bracketBrand;
    private TreatmentStage treatmentStatus;
    private ProductTypeName productTypeName;
    private List<String> teethExtraction;
    private BracesTreatmentStage bracesTreatmentStage;
    private String remarks;
    private String treatmentName;
    private String upperJawAnchorTypeValue;
    private String lowerJawAnchorTypeValue;
    private LocalDate treatmentStartDate;
    private String extractionRemarks;
}
