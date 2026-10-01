package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerCheckInUpdate;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerFeedbackRequest;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.CheckInSeverity;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AlignerCheckInForDoctorEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long alignerActionId;
    private Long patientId;

    private Long alignerJourneyId;
    private Integer alignerNo;

    @NotNull
    private JawType alignerJawType;

    @Nullable
    private List<AlignerPhotoDetails> alignerPhotos;

    private AlignerFeedbackRequest feedback;

    @Nullable
    private AlignerCheckInUpdate updateData;

    private CheckInSeverity checkInSeverity;
    private Long alignerId;

    @JsonCreator
    public AlignerCheckInForDoctorEventMetadata(
            Long alignerActionId,
            Long patientId,
            Long alignerJourneyId,
            Integer alignerNo,
            JawType alignerJawType,
            @Nullable List<AlignerPhotoDetails> alignerPhotos,
            AlignerFeedbackRequest feedback,
            @Nullable AlignerCheckInUpdate updateData,
            @Nullable CheckInSeverity checkInSeverity,
            Long alignerId) {
        super(EventMetadataType.ALIGNER_CHECK_IN_FOR_DOCTOR);
        this.alignerActionId = alignerActionId;
        this.patientId = patientId;
        this.alignerJourneyId = alignerJourneyId;
        this.alignerNo = alignerNo;
        this.alignerJawType = alignerJawType;
        this.alignerPhotos = alignerPhotos;
        this.feedback = feedback;
        this.updateData = updateData;
        this.checkInSeverity = checkInSeverity;
        this.alignerId = alignerId;
    }

    public static AlignerCheckInForDoctorEventMetadata checkIn(
            @Nullable Aligner aligner,
            @Nullable List<AlignerPhoto> alignerCheckInPhotos,
            Long patientId,
            AlignerFeedbackRequest feedback,
            AlignerAction action) {

        return AlignerCheckInForDoctorEventMetadata.builder()
                .alignerNo(aligner != null ? aligner.getSrNo() : null)
                .alignerJawType(aligner != null ? aligner.getJawType() : null)
                .alignerJourneyId(aligner != null ? aligner.getAlignerJourney().getId() : null)
                .alignerPhotos(
                        alignerCheckInPhotos != null
                                ? alignerCheckInPhotos.stream()
                                        .map(AlignerPhotoDetails::from)
                                        .toList()
                                : null)
                .patientId(patientId)
                .alignerActionId(action.getId())
                .feedback(feedback)
                .alignerId(aligner != null ? aligner.getId() : null)
                .build();
    }
}
