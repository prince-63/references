package com.dentalstack.patient.feature.treatmenttracking.service;

import com.dentalstack.patient.feature.treatmenttracking.dto.*;
import java.time.LocalDate;
import java.util.List;

public interface AlignerTrackingPlanService {

    TreatmentPlanResponse createTreatmentPlan(CreateTrackingTreatmentPlanRequest request);

    List<TreatmentPlanResponse> getPlansForPatient(Long patientId);

    TreatmentPlanResponse getPlanById(Long planId);

    TreatmentPlanResponse updatePlanStatus(Long planId, UpdateTreatmentPlanStatusRequest request);

    TreatmentPlanResponse extendCurrentAlignerWear(ExtendWearDaysRequest request, Long doctorId);

    TreatmentPlanResponse extendAllAlignersWear(ExtendWearDaysRequest request, Long doctorId);

    TreatmentPlanResponse revertWearDays(RevertWearDaysRequest request, Long doctorId);

    TreatmentPlanResponse moveToAligner(MoveAlignerRequest request, Long doctorId);

    TreatmentPlanResponse patientChangeAligner(Long treatmentPlanId, LocalDate changeDate, Long patientUserId);

    TreatmentPlanResponse checkIn(CheckInRequest request, Long patientUserId);

    TreatmentPlanResponse reportIssue(ReportIssueRequest request, Long patientUserId);
}
