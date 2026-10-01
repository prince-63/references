package com.dentalstack.patient.feature.calendar.dto.calendar.details;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlignerCheckInCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String patientName;
    private String profileUrl;
    private boolean isFeedbackNeedsReview;
    private boolean isPhotosUploaded;
    private JawType jawType;
    private int checkInForAlignerNo;
    private long patientId;
    private long alignerActionId;
    private long alignerJourneyId;
    private Long actionId;

    public static AlignerCheckInCalendarDetails from(
            String patientName,
            String profileUrl,
            boolean isPhotosUploaded,
            boolean isFeedbackNeedsReview,
            JawType jawType,
            int checkInForAlignerNo,
            long patientId,
            long alignerActionId,
            long alignerJourneyId,
            Long actionId) {
        return AlignerCheckInCalendarDetails.builder()
                .isPhotosUploaded(isPhotosUploaded)
                .isFeedbackNeedsReview(isFeedbackNeedsReview)
                .patientName(patientName)
                .profileUrl(profileUrl)
                .jawType(jawType)
                .checkInForAlignerNo(checkInForAlignerNo)
                .patientId(patientId)
                .alignerActionId(alignerActionId)
                .alignerJourneyId(alignerJourneyId)
                .actionId(actionId)
                .build();
    }
}
