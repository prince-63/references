package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.TimelineNoteAddedEventMetaData;
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
public class TimelineNoteAddedUpdates extends Update implements Serializable {

    private String note;
    private String title;
    private Long doctorId;
    private Long patientId;

    public static TimelineNoteAddedUpdates from(Event event, Patient patient) {
        var metadata = (TimelineNoteAddedEventMetaData) event.getMetadata();
        return TimelineNoteAddedUpdates.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .note(metadata.getNote())
                .patientId(metadata.getPatientId())
                .title(metadata.getTitle())
                .doctorId(metadata.getDoctorId())
                .build();
    }
}
