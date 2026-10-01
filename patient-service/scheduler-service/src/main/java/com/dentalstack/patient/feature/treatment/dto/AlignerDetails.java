package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.storage.dto.AlignerPhotoDetails;
import com.dentalstack.patient.feature.treatment.dto.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.treatment.dto.production.AlignerProductionDetails;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.DailyAlignerWearTime;
import com.dentalstack.patient.feature.treatment.enums.Compliance;
import com.dentalstack.patient.feature.treatment.enums.JawType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int srNo;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate changeDate;
    private Float avgTimeInSecs;
    private JawType jawType;
    private Integer noOfDaysToWear;
    private Compliance alignerCompliance;

    @Schema(
            title = "The offset of the change date from the end date.",
            description =
                    """
            The offset of the change date from the end date.
            If +ve then the change date is after the end date which means there was a delay in the aligner change.
            If -ve then the change date is before the end date which means the aligner change was early.
            If 0 then the aligner was changed at the end date.
            If null then the aligner is not changed yet or the change date is not applicable.
            """,
            nullable = true)
    private Integer changeOffset;

    private List<AlignerPhotoDetails> photos;
    private List<DailyWearTimeDetails> dailyWearTimeDetails;
    private List<AlignerFeedbackDetails> alignerFeedbacks;
    private AlignerProductionDetails alignerProduction;

    public static AlignerDetails from(Aligner aligner) {
        return AlignerDetails.builder()
                .srNo(aligner.getSrNo())
                .changeDate(aligner.getChangeDate())
                .startDate(aligner.getStartDate())
                .endDate(aligner.getEndDate())
                .avgTimeInSecs(aligner.avgWearTimeInSecsBasedOnCurrentAligner())
                .alignerCompliance(aligner.complianceBasedOnCurrentAligner())
                .photos(aligner.getPhotos().stream()
                        .filter(p -> !p.isDeleted())
                        .map(AlignerPhotoDetails::from)
                        .toList())
                .jawType(aligner.getJawType())
                .dailyWearTimeDetails(aligner.getDailyWearTimeRecords().stream()
                        .sorted(Comparator.comparing(DailyAlignerWearTime::getDate))
                        .map(DailyWearTimeDetails::from)
                        .toList())
                .alignerFeedbacks(aligner.getFeedbacks().stream()
                        .map(AlignerFeedbackDetails::from)
                        .sorted(Comparator.comparing(AlignerFeedbackDetails::getCreatedAt))
                        .toList())
                .alignerProduction(AlignerProductionDetails.from(aligner.getAlignerProduction()))
                .noOfDaysToWear(aligner.getNoOfDaysToWear())
                .changeOffset(aligner.changeOffset())
                .build();
    }
}
