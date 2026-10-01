package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import jakarta.annotation.Nullable;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerJourneyResponse implements Serializable {
    private Integer daysToWearEachAligner;

    private Integer currentAlignerNo;
    private Integer recommendedDailyWearHours;
    private String treatmentType;
    private String brandName;

    private JawType currentAlignerJawType;
    private LocalDate currentAlignerStartDate;
    private LocalDate currentAlignerEndDate;

    private UpperJawDetails upperJawDetails;
    private LowerJawDetails lowerJawDetails;
    private Boolean isAlignerJourneyDeactivated;

    public static AlignerJourneyResponse from(TreatmentPlan plan, AlignerJourney alignerJourney) {
        var tracking = plan.getTracking();
        Aligner currentAligner = getCurrentAligner(tracking);

        return AlignerJourneyResponse.builder()
                .daysToWearEachAligner(alignerJourney.getDaysToWearEachAligner())
                .currentAlignerNo(currentAligner != null ? currentAligner.getSrNo() : null)
                .recommendedDailyWearHours(alignerJourney.getRecommendedHoursToWearAligners())
                .treatmentType(plan.getTreatmentType())
                .brandName(plan.getBrandName())
                .currentAlignerJawType(currentAligner != null ? currentAligner.getJawType() : null)
                .currentAlignerStartDate(currentAligner != null ? currentAligner.getStartDate() : null)
                .currentAlignerEndDate(currentAligner != null ? currentAligner.getEndDate() : null)
                .upperJawDetails(plan.getAlignerDetailsMetadata().getUpperJawDetails())
                .lowerJawDetails(plan.getAlignerDetailsMetadata().getLowerJawDetails())
                .isAlignerJourneyDeactivated(false)
                .build();
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
