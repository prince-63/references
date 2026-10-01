package com.dentalstack.patient.feature.aligner.service;

import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerListResponse;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerRequest;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerResponse;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;

public interface UnprocessedAlignerService {
    UnprocessedAlignerListResponse getUnprocessedAlignerList(UnprocessedAlignerRequest request);

    UnprocessedAlignerResponse mapToUnprocessedAlignerResponse(TreatmentPlanSummary treatmentPlan);
}
