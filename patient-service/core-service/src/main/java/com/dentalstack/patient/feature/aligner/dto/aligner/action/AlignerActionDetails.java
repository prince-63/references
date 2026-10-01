package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerCheckInFeedbackDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.MiscAlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerChangeActionMetadata;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerActionDetails {

    private long alignerActionId;

    private AlignerStatistics aligner;

    private int recommendedHoursToWearAligners;

    @Builder.Default
    private List<AlignerPhotoDetails> photos = new ArrayList<>();

    @Builder.Default
    private List<MiscAlignerFeedbackDetails> comments = new ArrayList<>();

    private AlignerCheckInFeedbackDetails alignerCheckInFeedback;

    private AlignerIssueDetails alignerIssue;

    private long performedBy;
    private UserType performedByUserType;
    private ZonedDateTime performAt;

    private AlignerActionType type;

    private ZonedDateTime validateAt;

    @Builder.Default
    private boolean validated = false;

    private Long validatedBy;
    private UserType validatedByUserType;

    private AlignerDetails previousAlignerDetails;
    private AlignerDetails nextAlignerDetails;

    private Boolean moveToPreviousAlignerEnable;
    private AlignerUpdateCategory updateCategory;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlignerStatistics {
        private long srNo;
        private JawType jawType;
        private Compliance compliance;

        @Nullable
        private Float avgTimeInSecs;

        private int recommendedHoursToWearAligners;
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalDate changeDate;
        private Integer changeOffset;

        public static AlignerStatistics from(AlignerAction action) {
            var aligner = action.getAligner();

            AlignerChangeActionMetadata metadata = null;

            if (action.getMetadata().getType().equals(AlignerActionType.ALIGNER_CHANGE)) {
                metadata = (AlignerChangeActionMetadata) action.getMetadata();
            }

            LocalDate startDate = (metadata != null && metadata.getAlignerStartDate() != null)
                    ? metadata.getAlignerStartDate()
                    : aligner.getStartDate();

            LocalDate endDate = (metadata != null && metadata.getAlignerEndDate() != null)
                    ? metadata.getAlignerEndDate()
                    : aligner.getEndDate();

            LocalDate changeDate = (metadata != null && metadata.getChangeDate() != null)
                    ? metadata.getChangeDate()
                    : aligner.getChangeDate();

            Integer changeOffset = Aligner.calculateOverdueForAction(aligner, action);

            return new AlignerStatistics(
                    aligner.getSrNo(),
                    aligner.getJawType(),
                    aligner.compliance(),
                    aligner.avgWearTimeInSecsBasedOnCurrentAligner(),
                    aligner.getAlignerJourney().getRecommendedHoursToWearAligners(),
                    startDate,
                    endDate,
                    changeDate,
                    changeOffset);
        }
    }
}
