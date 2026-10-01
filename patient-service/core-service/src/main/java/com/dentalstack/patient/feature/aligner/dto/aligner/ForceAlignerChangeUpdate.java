package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerChangeStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.dentalstack.patient.feature.timeline.dto.AlignerChangeUpdate;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.ForceAlignerChangeEventEventMetadata;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Slf4j
public class ForceAlignerChangeUpdate extends Update implements Serializable {

    private Integer previousAlignerNo;
    private JawType previousAlignerJawType;
    private Integer newAlignerNo;
    private JawType newAlignerJawType;
    private Long alignerJourneyId;
    private LocalDate previousAlignerStartDate;
    private LocalDate previousAlignerEndDate;
    private LocalDate previousAlignerChangeDate;
    private AlignerChangeStatus previousAlignerChangeStatus;
    private Compliance previousAlignerCompliance;
    private List<AlignerFeedbackDetails> previousAlignerFeedbacks;
    private float previousAlignerAvgWearTimeInSecs;
    private List<AlignerPhotoDetails> previousAlignerPhotos;
    private List<AlignerPhotoDetails> newAlignerPhotos;
    private boolean validated;
    private ZonedDateTime validatedAt;
    private boolean active;

    public static AlignerChangeUpdate from(Event event, Patient patient) {
        ForceAlignerChangeEventEventMetadata metadata = (ForceAlignerChangeEventEventMetadata) event.getMetadata();

        return AlignerChangeUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .eventAt(event.getCreatedAt())
                .eventType(event.getType())
                .active(event.isActive())
                .previousAlignerChangeStatus(metadata.getPreviousAlignerChangeStatus())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .previousAlignerNo(metadata.getPreviousAlignerNo())
                .previousAlignerJawType(metadata.getPreviousAlignerJawType())
                .newAlignerJawType(metadata.getNewAlignerJawType())
                .newAlignerNo(metadata.getNewAlignerNo())
                .alignerJourneyId(metadata.getAlignerJourneyId())
                .previousAlignerStartDate(metadata.getPreviousAlignerStartDate())
                .previousAlignerEndDate(metadata.getPreviousAlignerEndDate())
                .previousAlignerChangeDate(metadata.getPreviousAlignerChangeDate())
                .previousAlignerCompliance(metadata.getPreviousAlignerCompliance())
                .previousAlignerAvgWearTimeInSecs(metadata.getPreviousAlignerAvgWearTimeInSecs())
                .newAlignerPhotos(metadata.getNewAlignerPhotos())
                .previousAlignerPhotos(metadata.getPreviousAlignerPhotos())
                .previousAlignerFeedbacks(metadata.getPreviousAlignerFeedbacks())
                .validated(metadata.getValidated())
                .validatedAt(metadata.getValidatedAt())
                .build();
    }
}
