package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.gallery.dto.AddAlignerPhotoRequest;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.PhotosUploadedEventMetadata;
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
public class PhotosUploadedUpdate extends Update implements Serializable {
    private AddAlignerPhotoRequest uploadPhotosDetails;
    private AlignerJourneyDetails alignerJourneyDetails;

    public static PhotosUploadedUpdate from(Event event, Patient patient) {
        var metadata = (PhotosUploadedEventMetadata) event.getMetadata();

        return PhotosUploadedUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerJourneyDetails(metadata.getAlignerJourneyDetails())
                .uploadPhotosDetails(metadata.getUploadPhotosDetails())
                .build();
    }
}
