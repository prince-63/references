package com.dentalstack.patient.feature.caseinfo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonSubTypes(value = {@JsonSubTypes.Type(value = Metadata.class, name = "METADATA")})
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Metadata {
    private Integer[] missingTeeth;
    private List<String> allergy;
    private List<String> medicalCondition;
    private List<String> dentalHistory;
    private ToothRelations relations;
    private Double overjet;
    private Double deepBite;
    private Integer deepBiteInPercentage;
    private Double openBite;
    private String midline;
    private String remarks;
    private String diagnosis;
    private String extraOralRemarks;
    private String cephalometricAnalysis;
    private String treatmentObjective;
    private String chiefComplaint;

    @JsonCreator
    public Metadata(
            @JsonProperty("missing_teeth") Integer[] missingTeeth,
            @JsonProperty("allergy") List<String> allergy,
            @JsonProperty("medical_condition") List<String> medicalCondition,
            @JsonProperty("dental_history") List<String> dentalHistory,
            @JsonProperty("relations") ToothRelations relations,
            @JsonProperty("overjet") Double overjet,
            @JsonProperty("deep_bite") Double deepBite,
            @JsonProperty("deep_bite_in_percentage") Integer deepBiteInPercentage,
            @JsonProperty("open_bite") Double openBite,
            @JsonProperty("midline") String midline,
            @JsonProperty("remarks") String remarks,
            @JsonProperty("diagnosis") String diagnosis,
            @JsonProperty("extra_oral_remarks") String extraOralRemarks,
            @JsonProperty("cephalometric_analysis") String cephalometricAnalysis,
            @JsonProperty("treatment_objective") String treatmentObjective,
            @JsonProperty("cheif_complaint") String chiefComplaint) {
        this.missingTeeth = missingTeeth;
        this.allergy = allergy;
        this.medicalCondition = medicalCondition;
        this.dentalHistory = dentalHistory;
        this.relations = relations;
        this.overjet = overjet;
        this.deepBite = deepBite;
        this.deepBiteInPercentage = deepBiteInPercentage;
        this.openBite = openBite;
        this.midline = midline;
        this.remarks = remarks;
        this.diagnosis = diagnosis;
        this.extraOralRemarks = extraOralRemarks;
        this.cephalometricAnalysis = cephalometricAnalysis;
        this.treatmentObjective = treatmentObjective;
        this.chiefComplaint = chiefComplaint;
    }
}
