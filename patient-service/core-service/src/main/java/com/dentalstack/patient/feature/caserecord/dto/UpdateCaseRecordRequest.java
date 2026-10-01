package com.dentalstack.patient.feature.caserecord.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateCaseRecordRequest {
    private String chiefComplaint;
    private String caseRecordName;
    private List<Long> preTreatmentFileIds;
    private List<Long> scanFileIds;
    private List<Long> xrayFileIds;
}
