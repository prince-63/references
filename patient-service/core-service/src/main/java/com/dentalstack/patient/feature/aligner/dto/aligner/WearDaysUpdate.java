package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.WearDaysUpdateEventMetaData;
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
public class WearDaysUpdate extends Update implements Serializable {
    private boolean isMultipleAlignerUpdated;

    public static WearDaysUpdate from(Event event, Patient patient) {
        var metadata = (WearDaysUpdateEventMetaData) event.getMetadata();
        return WearDaysUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .isMultipleAlignerUpdated(metadata.isMultipleAlignerUpdated())
                .build();
    }
}
