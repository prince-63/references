package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerJourneyPatientDetails implements Serializable {

    private Long patientId;
    private String patientName;
    private String patientMobileNumber;
    private String patientEmailId;
    private String patientProfilePhoto;
    private String alignerBrandName;
    private Integer currentAlignerNumber;
    private Integer totalAligners;
    private float avgWearTimeInSec;
    private Compliance compliance;

    public static AlignerJourneyPatientDetails from(AlignerJourney alignerJourney, Aligner currentAligner) {
        var patient = alignerJourney.getPatient();
        var aligners = alignerJourney.getAligners();
        return AlignerJourneyPatientDetails.builder()
                .avgWearTimeInSec(Optional.ofNullable(currentAligner.avgWearTimeInSecs(true, true))
                        .orElse(0f))
                .compliance(currentAligner.compliance())
                .totalAligners(aligners.size())
                .currentAlignerNumber(currentAligner.getSrNo())
                .alignerBrandName(alignerJourney.getBrand())
                .patientId(patient.getId())
                .patientEmailId(patient.getEmail())
                .patientMobileNumber(patient.getMobileNo())
                .patientName(patient.fullName())
                .patientProfilePhoto(patient.getProfilePictureUrl())
                .build();
    }
}
