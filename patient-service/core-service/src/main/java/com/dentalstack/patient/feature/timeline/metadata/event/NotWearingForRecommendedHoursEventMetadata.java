package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class NotWearingForRecommendedHoursEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private Integer currentAlignerNo;
    private Float avgWearTimeInSecs;
    private Compliance compliance;
    private Long noOfDaysWorn;

    @JsonCreator
    public NotWearingForRecommendedHoursEventMetadata(
            PatientDetails patientDetails,
            Integer currentAlignerNo,
            Float avgWearTimeInSecs,
            Compliance compliance,
            Long noOfDaysWorn) {
        super(EventMetadataType.NOT_WEARING_FOR_RECOMMENDED_HOURS);
        this.patientDetails = patientDetails;
        this.currentAlignerNo = currentAlignerNo;
        this.avgWearTimeInSecs = avgWearTimeInSecs;
        this.compliance = compliance;
        this.noOfDaysWorn = noOfDaysWorn;
    }
}
