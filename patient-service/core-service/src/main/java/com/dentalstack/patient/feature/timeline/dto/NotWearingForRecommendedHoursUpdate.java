package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.NotWearingForRecommendedHoursEventMetadata;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NotWearingForRecommendedHoursUpdate extends Update implements Serializable {
    private PatientDetails patientDetails;
    private Integer currentAlignerNo;
    private Float avgWearTimeInSecs;
    private Compliance compliance;
    private Long noOfDaysWorn;

    public static NotWearingForRecommendedHoursUpdate from(Event event, Patient patient) {
        NotWearingForRecommendedHoursEventMetadata metadata =
                (NotWearingForRecommendedHoursEventMetadata) event.getMetadata();

        return NotWearingForRecommendedHoursUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .patientDetails(metadata.getPatientDetails())
                .currentAlignerNo(metadata.getCurrentAlignerNo())
                .avgWearTimeInSecs(metadata.getAvgWearTimeInSecs())
                .compliance(metadata.getCompliance())
                .noOfDaysWorn(metadata.getNoOfDaysWorn())
                .build();
    }
}
