package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerSrNoDetails;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import jakarta.annotation.Nullable;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllAlignerActions {
    private List<AlignerActionBriefDetails> actions = new ArrayList<>();

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlignerActionBriefDetails {
        private long alignerActonId;
        private AlignerSrNoDetails previousAligner;

        @Nullable
        private AlignerSrNoDetails newAligner;

        private AlignerActionType type;
        private ZonedDateTime performedAt;

        private AlignerUpdateCategory updateCategory;
        private String updateCategoryReason;
    }
}
