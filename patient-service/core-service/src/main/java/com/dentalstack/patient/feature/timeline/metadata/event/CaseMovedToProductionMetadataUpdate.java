package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
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
public class CaseMovedToProductionMetadataUpdate extends Update implements Serializable {
    private Long patientId;
    private String patientName;

    public static CaseMovedToProductionMetadataUpdate from(Event event, Patient patient) {
        return CaseMovedToProductionMetadataUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .active(event.isActive())
                .read(event.isRead())
                .build();
    }
}
