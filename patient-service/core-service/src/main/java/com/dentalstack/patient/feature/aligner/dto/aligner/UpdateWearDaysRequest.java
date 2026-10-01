package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.dto.aligner.production.UpdateAlignerProductionRequest;
import jakarta.validation.constraints.Min;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateWearDaysRequest {

    private long alignerJourneyId;
    private Set<Integer> alignerNos;

    @Min(value = 1, message = "Days to wear each aligner must be greater than 0")
    private int daysToWearEachAligner;

    public static UpdateWearDaysRequest from(
            Long alignerJourneyId, Set<Integer> alignerNos, int daysToWearEachAligner) {
        return UpdateWearDaysRequest.builder()
                .alignerJourneyId(alignerJourneyId)
                .alignerNos(alignerNos)
                .daysToWearEachAligner(daysToWearEachAligner)
                .build();
    }

    public static UpdateWearDaysRequest from(UpdateAlignerProductionRequest request) {
        Integer wearDays = request.getWearDays();
        return UpdateWearDaysRequest.builder()
                .alignerJourneyId(request.getAlignerJourneyId())
                .alignerNos(request.getAlignerNos())
                .daysToWearEachAligner(wearDays != null ? wearDays : 0)
                .build();
    }
}
