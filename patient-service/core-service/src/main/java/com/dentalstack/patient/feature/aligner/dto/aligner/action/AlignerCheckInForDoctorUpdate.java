package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerCheckInFeedbackDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFeedbackType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AlignerCheckInForDoctorUpdate extends Update implements Serializable {

    private Long alignerJourneyId;
    private Integer alignerNo;
    private long alignerActionId;

    @NotNull
    private JawType alignerJawType;

    @Nullable
    private List<AlignerPhotoDetails> alignerPhotos;

    private Long patientId;

    private Long alignerId;

    @Builder.Default
    private List<AlignerFeedbackDetails> comments = new ArrayList<>();

    private AlignerCheckInFeedbackDetails feedback;

    public static AlignerCheckInForDoctorUpdate from(
            Event event,
            Patient patient,
            AlignerAction action,
            List<AlignerFeedback> feedbacks,
            List<AlignerPhoto> photos) {
        var aligner = action.getAligner();
        var alignerCheckInFeedback = feedbacks.stream()
                .filter(f -> f.getFeedbackType().equals(AlignerFeedbackType.ALIGNER_CHECK_IN))
                .findAny();

        return AlignerCheckInForDoctorUpdate.builder()
                .alignerActionId(action.getId())
                .eventId(event.getId())
                .patientId(patient.getId())
                .eventType(event.getType())
                .eventAt(event.getCreatedAt())
                .patientName(patient.fullName())
                .patientProfileImageUrl(patient.getProfilePictureUrl())
                .active(event.isActive())
                .read(event.isRead())
                .alignerJawType(aligner.getJawType())
                .alignerNo(aligner.getSrNo())
                .patientId(patient.getId())
                .alignerPhotos(photos.stream().map(AlignerPhotoDetails::from).toList())
                .alignerJourneyId(aligner.getAlignerJourney().getId())
                .feedback(alignerCheckInFeedback
                        .map(AlignerCheckInFeedbackDetails::from)
                        .orElse(null))
                .comments(feedbacks.stream()
                        .filter(f -> f.getFeedbackType().equals(AlignerFeedbackType.MISC))
                        .map(AlignerFeedbackDetails::from)
                        .toList())
                .alignerId(action.getAligner().getId())
                .build();
    }
}
