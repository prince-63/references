package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerChangeStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.dto.Update;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.metadata.event.ManualAlignerChangeEventEventMetadata;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
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
public class ManualAlignerChangeUpdate extends Update implements Serializable {
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
    private boolean validated;
    private ZonedDateTime validatedAt;
    private boolean active;
    private long daysGapFromEndDateToChangeDate;
    private Long alignerActionId;
    private Long alignerId;

    public static ManualAlignerChangeUpdate from(Event event, Patient patient) {
        ManualAlignerChangeEventEventMetadata metadata = (ManualAlignerChangeEventEventMetadata) event.getMetadata();

        long daysGap = 0;
        if (metadata.getPreviousAlignerEndDate() != null && metadata.getPreviousAlignerChangeDate() != null) {
            daysGap = ChronoUnit.DAYS.between(
                    metadata.getPreviousAlignerEndDate(), metadata.getPreviousAlignerChangeDate());
        }

        return ManualAlignerChangeUpdate.builder()
                .eventId(event.getId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .eventAt(event.getCreatedAt())
                .eventType(event.getType())
                .active(event.isActive())
                .read(event.isRead())
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
                .previousAlignerFeedbacks(metadata.getPreviousAlignerFeedbacks())
                .validated(metadata.getValidated())
                .validatedAt(metadata.getValidatedAt())
                .daysGapFromEndDateToChangeDate(daysGap)
                .alignerActionId(metadata.getAlignerActionId())
                .alignerId(metadata.getAlignerId())
                .build();
    }
}
