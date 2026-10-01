package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentResponse;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentPlanAddedEventMetaData;
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
public class TreatmentPlanAddUpdate extends Update implements Serializable {

    private AlignerTreatmentResponse alignerTreatmentResponse;
    private String patientType;
    private Boolean hasReadExistingPatientForm;

    public static TreatmentPlanAddUpdate from(Event event, Patient patient) {
        var metadata = (TreatmentPlanAddedEventMetaData) event.getMetadata();
        return TreatmentPlanAddUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerTreatmentResponse(metadata.getAlignerTreatmentResponse())
                .patientType(metadata.getPatientType())
                .hasReadExistingPatientForm(patient.getHasReadExistingPatientForm())
                .build();
    }
}
