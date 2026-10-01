package com.dentalstack.patient.feature.mcp.service.impl;

import com.dentalstack.patient.feature.mcp.dto.request.PatientDetailedSummeryRequest;
import com.dentalstack.patient.feature.mcp.dto.response.PatientDetailedSummeryResponse;
import com.dentalstack.patient.feature.mcp.dto.summery.PatientDetailedSummary;
import com.dentalstack.patient.feature.mcp.service.McpApiExposeService;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class McpApiExposeServiceImpl implements McpApiExposeService {

    private final PatientRepository patientRepository;

    @Override
    public List<PatientDetailedSummeryResponse> getPatientDetailedSummery(PatientDetailedSummeryRequest request) {
        Long organizationId = request.getOrganizationId();
        String searchQuery = request.getQuery();

        var patientDetailedSummaries = patientRepository.findPatientsWithDetailedSummary(organizationId, searchQuery);

        return patientDetailedSummaries.stream()
                .map(this::mapToPatientDetailedSummeryResponse)
                .collect(Collectors.toList());
    }

    private PatientDetailedSummeryResponse mapToPatientDetailedSummeryResponse(PatientDetailedSummary summary) {
        PatientDetailedSummeryResponse response = PatientDetailedSummeryResponse.builder()
                .patientId(summary.getPatientId())
                .firstName(summary.getFirstName())
                .lastName(summary.getLastName())
                .email(summary.getEmail())
                .mobileNumber(summary.getMobileNumber())
                .customerMappedId(summary.getCustomerMappedId())
                .profilePictureUrl(summary.getProfilePictureUrl())
                .uuid(summary.getUuid())
                .patientName(summary.getFirstName() + " " + summary.getLastName())
                .totalTreatmentPlans(summary.getTotalTreatmentPlans())
                .draftInProgressCount(summary.getDraftInProgressCount())
                .inProgressCount(summary.getInProgressCount())
                .sentForApprovalCount(summary.getSentForApprovalCount())
                .pendingApprovalCount(summary.getPendingApprovalCount())
                .approvedCount(summary.getApprovedCount())
                .activeCount(summary.getActiveCount())
                .archivedCount(summary.getArchivedCount())
                .rePlanCount(summary.getRePlanCount())
                .deactivatedCount(summary.getDeactivatedCount())
                .totalOrders(summary.getTotalOrders())
                .orderedCount(summary.getOrderedCount())
                .orderInProgressCount(summary.getOrderInProgressCount())
                .orderInReviewCount(summary.getOrderInReviewCount())
                .orderOnHoldCount(summary.getOrderOnHoldCount())
                .orderRePlanCount(summary.getOrderRePlanCount())
                .orderApprovedCount(summary.getOrderApprovedCount())
                .orderCompletedCount(summary.getOrderCompletedCount())
                .orderDraftCount(summary.getOrderDraftCount())
                .orderNeedMoreInfoCount(summary.getOrderNeedMoreInfoCount())
                .orderCancelledCount(summary.getOrderCancelledCount())
                .orderStlFilesRequestedCount(summary.getOrderStlFilesRequestedCount())
                .orderStlFilesUploadedCount(summary.getOrderStlFilesUploadedCount())
                .orderNewCount(summary.getOrderNewCount())
                .orderUnassignedCount(summary.getOrderUnassignedCount())
                .orderUrgentCount(summary.getOrderUrgentCount())
                .totalManufacturingBatches(summary.getTotalManufacturingBatches())
                .totalAlignersDelivered(summary.getTotalAlignersDelivered())
                .totalAlignersInInventory(summary.getTotalAlignersInInventory())
                .totalAlignersInTransit(summary.getTotalAlignersInTransit())
                .totalAlignersPending(summary.getTotalAlignersPending())
                .totalAlignerJourneys(summary.getTotalAlignerJourneys())
                .alignerJourneyNotStartedCount(summary.getAlignerJourneyNotStartedCount())
                .alignerJourneyInProgressCount(summary.getAlignerJourneyInProgressCount())
                .alignerJourneyCompletedCount(summary.getAlignerJourneyCompletedCount())
                .alignerJourneyDeactivatedCount(summary.getAlignerJourneyDeactivatedCount())
                .alignerJourneyOnHoldCount(summary.getAlignerJourneyOnHoldCount())
                .alignerJourneyCancelledCount(summary.getAlignerJourneyCancelledCount())
                .caseRecordAdded(summary.getCaseRecordAdded())
                .prescriptionAdded(summary.getPrescriptionAdded())
                .alignerJourneyAdded(summary.getAlignerJourneyAdded())
                .treatmentStarted(summary.getTreatmentStarted())
                .build();

        String nextStep = determineNextStep(summary);
        response.setNextStep(nextStep);

        return response;
    }

    private String determineNextStep(PatientDetailedSummary summary) {

        if (hasAlignerJourney(summary)) {
            if (hasNotStartedTreatment(summary)) {
                return "Start Aligner Treatment";
            }
            if (hasStartedTreatment(summary)) {
                return "Track Aligner Journey";
            }
        }

        String treatmentPlanNextStep = checkTreatmentPlanNextStep(summary);
        if (treatmentPlanNextStep != null) {
            return treatmentPlanNextStep;
        }

        String orderNextStep = checkOrderNextStep(summary);
        if (orderNextStep != null) {
            return orderNextStep;
        }

        return checkCaseRecordAndPrescriptionNextStep(summary);
    }

    private boolean hasAlignerJourney(PatientDetailedSummary summary) {
        return summary.getTotalAlignerJourneys() != null && summary.getTotalAlignerJourneys() > 0;
    }

    private boolean hasNotStartedTreatment(PatientDetailedSummary summary) {
        return summary.getAlignerJourneyNotStartedCount() != null && summary.getAlignerJourneyNotStartedCount() > 0;
    }

    private boolean hasStartedTreatment(PatientDetailedSummary summary) {
        return summary.getAlignerJourneyInProgressCount() != null && summary.getAlignerJourneyInProgressCount() > 0;
    }

    private String checkTreatmentPlanNextStep(PatientDetailedSummary summary) {

        boolean hasDraftTreatmentPlan =
                (summary.getDraftInProgressCount() != null && summary.getDraftInProgressCount() > 0)
                        || (summary.getInProgressCount() != null && summary.getInProgressCount() > 0);

        boolean hasActiveTreatmentPlan = summary.getActiveCount() != null && summary.getActiveCount() > 0;

        if (hasDraftTreatmentPlan) {
            return "Save Draft Treatment Plan";
        }
        if (hasActiveTreatmentPlan) {
            return "Add Aligner Journey & Start Manufacturing";
        }

        return null;
    }

    private String checkOrderNextStep(PatientDetailedSummary summary) {

        boolean hasOrderedOrder = summary.getOrderedCount() != null && summary.getOrderedCount() > 0;

        boolean hasDraftOrder = summary.getOrderDraftCount() != null && summary.getOrderDraftCount() > 0;

        if (hasOrderedOrder) {
            return "Add Treatment Plan";
        }
        if (hasDraftOrder) {
            return "Save Draft Order";
        }

        return null;
    }

    private String checkCaseRecordAndPrescriptionNextStep(PatientDetailedSummary summary) {
        Boolean caseRecordAdded = summary.getCaseRecordAdded();
        Boolean prescriptionAdded = summary.getPrescriptionAdded();

        if (caseRecordAdded == null || !caseRecordAdded) {
            return "Add Case Record";
        }
        if (prescriptionAdded == null || !prescriptionAdded) {
            return "Add Prescription";
        }

        return "Create Order";
    }
}
