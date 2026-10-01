package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerWiseStats {
    private float avgWearTimeInSecs;
    private int recommendedHoursToWearAligners;

    private List<AlignerAvgWearTime> aligners;

    private ComplianceDetails complianceDetails;
    private Compliance currentAlignerCompliance;
    private JawType currentAlignerJawType;
    private Integer currentAlignerNo;
    private float complianceRate;

    public static AlignerWiseStats from(AlignerJourney alignerJourney) {
        Aligner currentAligner = alignerJourney.getCurrentAligner();
        Compliance currentAlignerCompliance = null;
        JawType currentAlignerJawType = null;
        Integer currentAlignerNo = null;
        if (currentAligner != null) {
            currentAlignerCompliance = currentAligner.compliance();
            currentAlignerJawType = currentAligner.getJawType();
            currentAlignerNo = currentAligner.getSrNo();
        }

        float avgWearTimeHours = alignerJourney.avgWearTimeInSecs() / 3600f;

        float complianceRate = (avgWearTimeHours / alignerJourney.getRecommendedHoursToWearAligners()) * 100;

        return AlignerWiseStats.builder()
                .recommendedHoursToWearAligners(alignerJourney.getRecommendedHoursToWearAligners())
                .avgWearTimeInSecs(alignerJourney.avgWearTimeInSecs())
                .aligners(alignerJourney.getAligners().stream()
                        .sorted(Comparator.comparing(Aligner::getSrNo))
                        .map(AlignerAvgWearTime::from)
                        .toList())
                .complianceDetails(ComplianceDetails.from(alignerJourney))
                .currentAlignerCompliance(currentAlignerCompliance)
                .currentAlignerNo(currentAlignerNo)
                .currentAlignerJawType(currentAlignerJawType)
                .complianceRate(complianceRate)
                .build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlignerAvgWearTime {
        private int srNo;
        private float avgWearTimeInSecs;

        public static AlignerAvgWearTime from(Aligner aligner) {
            return new AlignerAvgWearTime(
                    aligner.getSrNo(),
                    Optional.ofNullable(aligner.avgWearTimeInSecs(true, true)).orElse(0f));
        }
    }
}
