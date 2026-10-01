package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResumeTreatmentResponse {

    private LocalDate pauseDate;
    private LocalDate resumeDate;
    private Integer treatmentPauseDurationInDays;

    private Integer oldRemainingDaysToWear;
    private Integer newRemainingDaysToWear;

    private Integer currentAlignerNo;
    private Integer nextAlignerNo;
    private LocalDate alignerChangeDate;
    private JawType currentAlignerJawType;
    private JawType nextAlignerJawType;

    private Boolean isCurrentAlignerChanged;
    private Boolean isCurrentAlignerDaysExtended;

    public static ResumeTreatmentResponse from(Tracking tracking) {
        Aligner nextAligner = getNextAligner(tracking);
        Aligner currentAligner = getCurrentAligner(tracking);
        Aligner previousAligner = null;
        if (tracking.getAlignerJourney() != null) {
            assert currentAligner != null;
            if (currentAligner.getSrNo() > 1) {
                previousAligner = tracking.getAlignerJourney().getAligner(currentAligner.getSrNo() - 1);
            }
        }
        Integer pauseDurationInDays = null;
        if (tracking.getPauseDate() != null && tracking.getResumeDate() != null) {
            pauseDurationInDays = (int) ChronoUnit.DAYS.between(tracking.getPauseDate(), tracking.getResumeDate());
        }
        Integer oldRemainingDaysToWear;
        if (tracking.getResumeDate() != null) {
            LocalDate resumeDate = tracking.getResumeDate();
            assert currentAligner != null;
            LocalDate endDate = currentAligner.getEndDate();

            if (endDate != null) {
                long gapDays = ChronoUnit.DAYS.between(resumeDate, endDate);
                oldRemainingDaysToWear = (int) gapDays;
            } else {
                oldRemainingDaysToWear = null;
            }
        } else {
            oldRemainingDaysToWear = null;
        }

        LocalDate alignerChangeDate = null;
        if (Boolean.TRUE.equals(tracking.getIsCurrentAlignerChanged())) {
            alignerChangeDate = previousAligner != null ? previousAligner.getEndDate() : null;
        } else {
            alignerChangeDate = currentAligner != null ? currentAligner.getEndDate() : null;
        }

        return ResumeTreatmentResponse.builder()
                .pauseDate(tracking.getPauseDate())
                .resumeDate(tracking.getResumeDate())
                .treatmentPauseDurationInDays(pauseDurationInDays)
                .oldRemainingDaysToWear(oldRemainingDaysToWear)
                .newRemainingDaysToWear(tracking.getDaysExtended())
                .currentAlignerNo(currentAligner != null ? currentAligner.getSrNo() : null)
                .nextAlignerNo(nextAligner != null ? nextAligner.getSrNo() : null)
                .alignerChangeDate(alignerChangeDate)
                .currentAlignerJawType(currentAligner != null ? currentAligner.getJawType() : null)
                .nextAlignerJawType(nextAligner != null ? nextAligner.getJawType() : null)
                .isCurrentAlignerChanged(tracking.getIsCurrentAlignerChanged())
                .isCurrentAlignerDaysExtended(tracking.getIsCurrentAlignerDaysExtended())
                .build();
    }

    @Nullable
    private static Aligner getNextAligner(Tracking tracking) {
        Aligner nextAligner = null;

        var alignerJourney = tracking.getAlignerJourney();
        if (alignerJourney != null) {
            var currentAligner = alignerJourney.getCurrentAligner();
            var currentAlignerNo = currentAligner != null ? currentAligner.getSrNo() : null;
            var nextAlignerNo = currentAlignerNo != null ? currentAlignerNo + 1 : null;

            if (nextAlignerNo != null) {
                nextAligner = alignerJourney.getAligner(nextAlignerNo);
            }
        }
        return nextAligner;
    }

    @Nullable
    private static Aligner getCurrentAligner(Tracking tracking) {
        Aligner currentAligner = null;

        var alignerJourney = tracking.getAlignerJourney();
        if (alignerJourney != null) {
            currentAligner = alignerJourney.getCurrentAligner();
        }
        return currentAligner;
    }
}
