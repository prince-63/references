package com.dentalstack.patient.feature.patient.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PatientDetailsMetadata {

    private LocalDateTime nextFollowUp;
    private String labels;
    private MedicalInformation medicalInformation;
    private String dateOfBirth;
    private String bloodGroup;
    private String emergencyContact;
    private Boolean newCase;
    private String product;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class MedicalInformation {
        private List<String> allergies;
        private List<String> medicalConditions;
        private List<String> currentMedications;
    }
}
