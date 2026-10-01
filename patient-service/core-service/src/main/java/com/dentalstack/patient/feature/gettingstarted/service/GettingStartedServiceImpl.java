package com.dentalstack.patient.feature.gettingstarted.service;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.caserecord.entity.CaseRecord;
import com.dentalstack.patient.feature.caserecord.repository.CaseRecordRepository;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.PracticeLocationRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.gettingstarted.dto.*;
import com.dentalstack.patient.feature.gettingstarted.entity.GettingStarted;
import com.dentalstack.patient.feature.gettingstarted.enums.GettingStartedEnum;
import com.dentalstack.patient.feature.gettingstarted.enums.GettingStartedFilter;
import com.dentalstack.patient.feature.gettingstarted.repository.GettingStartedRepository;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.order.dto.ManufacturingDetails;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.projection.OrderSummary;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GettingStartedServiceImpl implements GettingStartedService {

    private final GettingStartedRepository gettingStartedRepository;
    private final DoctorService doctorService;
    private final PracticeLocationRepository practiceLocationRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final InvitationRepository invitationRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final CaseRecordRepository caseRecordRepository;
    private final OrderRepository orderRepository;
    private final ReminderRepository reminderRepository;

    @Override
    public void skipGettingStarted(SkipGettingStartedRequest request) {

        var profileId = request.getProfileId();
        var organizationId = request.getOrganizationId();
        var doctorId = request.getDoctorId();
        var gettingStartedEnum = request.getGettingStartedEnum();
        Optional<GettingStarted> existingPreference =
                gettingStartedRepository.findByProfileIdAndOrganizationIdAndGettingStartedEnum(
                        profileId, organizationId, gettingStartedEnum);

        if (existingPreference.isPresent()) {
            GettingStarted preference = existingPreference.get();
            preference.setIsEnabled(true);
            gettingStartedRepository.save(preference);
        } else {
            GettingStarted newPreference = GettingStarted.builder()
                    .profileId(profileId)
                    .organizationId(organizationId)
                    .doctorId(doctorId)
                    .gettingStartedEnum(gettingStartedEnum)
                    .isEnabled(true)
                    .build();

            gettingStartedRepository.save(newPreference);
        }
    }

    @Override
    public DoctorDashboardGettingStartedDetails gettingStartedDetails(GettingStartedRequest request) {
        var profileId = request.getProfileId();
        var organizationId = request.getOrganizationId();
        var doctorId = request.getDoctorId();
        Long practiceLocationCount = practiceLocationRepository.countByDoctorId(doctorId);
        List<Long> patientIds;

        UserProfile userProfile =
                userProfileRepository.findByIdWithRoles(profileId).orElseThrow(DoctorNotFoundException::new);

        if (isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            patientIds =
                    patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithoutArchive(organizationId);
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfileWithoutArchive(
                    doctorId, organizationId, profileId);
        }
        List<GettingStarted> preferences = gettingStartedRepository.findByProfileIdAndOrganizationIdAndDoctorId(
                profileId, organizationId, doctorId);

        Map<GettingStartedEnum, Boolean> preferenceMap = preferences.stream()
                .collect(Collectors.toMap(
                        GettingStarted::getGettingStartedEnum,
                        GettingStarted::getIsEnabled,
                        (existingValue, newValue) -> existingValue || newValue));

        DoctorInvitationCountDetails doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));

        return DoctorDashboardGettingStartedDetails.builder()
                .isPatientAdded(preferenceMap.getOrDefault(
                        GettingStartedEnum.NEW_PATIENT_ADDED, patientIds != null && !patientIds.isEmpty()))
                .isPracticeLocationAdded(preferenceMap.getOrDefault(
                        GettingStartedEnum.PRACTICE_LOCATION_ADDED,
                        practiceLocationCount != null && practiceLocationCount > 0))
                .isUserAdded(preferenceMap.getOrDefault(
                        GettingStartedEnum.NEW_USER_ADDED,
                        doctorInvitationCount.getUserCount() != null && doctorInvitationCount.getUserCount() > 0))
                .isCustomerAdded(preferenceMap.getOrDefault(
                        GettingStartedEnum.NEW_CUSTOMER_ADDED,
                        doctorInvitationCount.getCustomerCount() != null
                                && doctorInvitationCount.getCustomerCount() > 0))
                .isBrandDetailsAdded(preferenceMap.getOrDefault(GettingStartedEnum.BRAND_DETAILS_ADDED, false))
                .isCompanyDetailsAdded(preferenceMap.getOrDefault(
                        GettingStartedEnum.COMPANY_DETAILS_ADDED,
                        doctorInvitationCount.isBrandAndCompanyDetailsAdded()))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GettingStartedResponse gettingStartedOverviewDetails(GettingStartedDetailsRequest request) {
        GettingStartedFilter filter = request.getFilterByStep();
        var patientId = request.getPatientId();

        var treatmentPlans = treatmentPlanRepository.findPrioritizedPlans(patientId);
        var treatmentPlan = treatmentPlans.stream().findFirst();
        var profileId = patientDoctorOrganizationRepository
                .findUserProfileIdByPatientId(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        List<Order> orders =
                orderRepository.findByPatientIdWhereProfileIdEqualsOwnerProfileId(request.getPatientId(), profileId);
        var purchaseOrder =
                orderRepository.findLatestPurchaseOrderSummaryByPatientIdWhereProfileIdEqualsOwnerProfileIdNative(
                        request.getPatientId(), request.getProfileId());
        var currentStep = determineCurrentStep(treatmentPlan.orElse(null), patientId, orders);
        Order order = null;
        Order draftOrder = null;
        if (treatmentPlan.isPresent() && !treatmentPlan.get().getStatus().equals(AlignerTreatmentStatus.DEACTIVATED)) {
            order = treatmentPlan.get().getOrder();
            if (order == null) {
                throw new TreatmentNotFoundException(request.getPatientId());
            }
        } else {
            draftOrder = (orders != null
                            && !orders.isEmpty()
                            && orders.stream().allMatch(o -> OrderStatus.DRAFT.equals(o.getStatus())))
                    ? orders.get(0)
                    : null;
            if (draftOrder == null && orders != null) {
                order = orders.stream()
                        .filter(o -> !OrderStatus.DRAFT.equals(o.getStatus())
                                && !OrderStatus.COMPLETED.equals(o.getStatus()))
                        .max(Comparator.comparing(Order::getCreatedAt))
                        .orElse(null);
            }
        }

        var anyInvitationBeenSent = invitationRepository.hasAnyInvitationBeenSent(patientId);

        return switch (filter != null ? filter : currentStep) {
            case ASSESSMENT -> getAssessment(
                    request,
                    anyInvitationBeenSent,
                    order,
                    currentStep,
                    draftOrder,
                    treatmentPlan.orElse(null),
                    purchaseOrder.orElse(null));
            case PLANNING -> getPlanning(
                    request, anyInvitationBeenSent, order, currentStep, purchaseOrder.orElse(null));
            case IN_MANUFACTURING -> getInManufacturing(
                    anyInvitationBeenSent, order, currentStep, treatmentPlan.orElse(null));
            case IN_TRANSIT -> getInTransit(anyInvitationBeenSent, order, currentStep, treatmentPlan.orElse(null));
            case STARTING_SOON -> getStartingSoon(
                    anyInvitationBeenSent, order, currentStep, profileId, treatmentPlan.orElse(null));
        };
    }

    private GettingStartedFilter determineCurrentStep(TreatmentPlan treatmentPlan, Long patientId, List<Order> orders) {
        Order order;
        GettingStartedFilter status;

        if (treatmentPlan != null) {

            if (treatmentPlan.getStatus() == AlignerTreatmentStatus.DEACTIVATED) {
                boolean hasValidOrder = orders.stream()
                        .anyMatch(o -> o.getStatus() != OrderStatus.DRAFT && o.getStatus() != OrderStatus.COMPLETED);

                status = hasValidOrder ? GettingStartedFilter.PLANNING : GettingStartedFilter.ASSESSMENT;
                return status;
            }

            order = treatmentPlan.getOrder();
            if (order == null) {
                throw new TreatmentNotFoundException(patientId);
            }

            List<ManufacturingBatch> batches = treatmentPlan.getManufacturingBatches();
            if (batches == null || batches.isEmpty()) {
                status = GettingStartedFilter.IN_MANUFACTURING;
            } else {
                boolean anyInManufacturing = batches.stream()
                        .anyMatch(b -> b.getStatus() != ManufacturingStatus.DELIVERED
                                && b.getStatus() != ManufacturingStatus.SHIPPED);

                boolean anyShippedNotDelivered =
                        batches.stream().anyMatch(b -> b.getStatus() == ManufacturingStatus.SHIPPED);

                boolean anyDelivered = batches.stream().anyMatch(b -> b.getStatus() == ManufacturingStatus.DELIVERED);

                if (anyInManufacturing) {
                    status = GettingStartedFilter.IN_MANUFACTURING;
                } else if (anyShippedNotDelivered) {
                    status = GettingStartedFilter.IN_TRANSIT;
                } else if (anyDelivered) {
                    status = GettingStartedFilter.STARTING_SOON;
                } else {
                    status = GettingStartedFilter.PLANNING;
                }
            }
        } else {
            var firstOrdered = orders.stream()
                    .filter(o -> !OrderStatus.DRAFT.equals(o.getStatus()))
                    .findFirst()
                    .orElse(null);

            if (firstOrdered != null) {
                status = GettingStartedFilter.PLANNING;
            } else {
                status = GettingStartedFilter.ASSESSMENT;
            }
        }

        return status;
    }

    private GettingStartedResponse getAssessment(
            GettingStartedDetailsRequest request,
            boolean anyInvitationBeenSent,
            Order order,
            GettingStartedFilter currentStep,
            Order draftOrder,
            TreatmentPlan treatmentPlan,
            OrderSummary purchaseOrder) {
        var patientId = request.getPatientId();

        var caseRecords = caseRecordRepository.findAllByPatientId(patientId);

        boolean scanFiles = false;
        boolean preTreatmentPhotos = false;
        boolean xRaysOpg = false;

        int scanFilesCount = 0;
        int preTreatmentPhotosCount = 0;
        int xRaysOpgCount = 0;
        Long caseRecordId = null;

        if (!caseRecords.isEmpty()) {
            Optional<CaseRecord> firstCaseRecord = caseRecords.stream().findFirst();

            CaseRecord record = firstCaseRecord.get();
            caseRecordId = record.getId();

            if (record.getScanFiles() != null && !record.getScanFiles().isEmpty()) {
                scanFiles = true;
                scanFilesCount = record.getScanFiles().size();
            }

            if (record.getPreTreatmentFiles() != null
                    && !record.getPreTreatmentFiles().isEmpty()) {
                preTreatmentPhotos = true;
                preTreatmentPhotosCount = record.getPreTreatmentFiles().size();
            }

            if (record.getXRaysFiles() != null && !record.getXRaysFiles().isEmpty()) {
                xRaysOpg = true;
                xRaysOpgCount = record.getXRaysFiles().size();
            }
        }

        var assessmentDetails = GettingStartedResponse.AssessmentDetails.builder()
                .preTreatmentPhotos(preTreatmentPhotos)
                .scanFiles(scanFiles)
                .xRaysOpg(xRaysOpg)
                .caseRecordsId(caseRecordId)
                .treatmentPlanStatus(treatmentPlan != null ? treatmentPlan.getStatus() : null)
                .deactivatedAt(treatmentPlan != null ? treatmentPlan.getDeactivatedAt() : null)
                .deactivationReason(treatmentPlan != null ? treatmentPlan.getReasonForDeactivation() : null)
                .deactivationRemark(treatmentPlan != null ? treatmentPlan.getOtherRemarks() : null)
                .scanFilesCount(scanFilesCount)
                .preTreatmentPhotosCount(preTreatmentPhotosCount)
                .xRaysOpgCount(xRaysOpgCount)
                .purchaseOrderId(purchaseOrder != null ? purchaseOrder.getOrderId() : null)
                .purchaseOrderStatus(purchaseOrder != null ? purchaseOrder.getOrderStatus() : null)
                .purchaseOrderTreatmentPlanCount(purchaseOrder != null ? purchaseOrder.getTreatmentPlanCount() : 0)
                .cancelledOn(
                        order != null && order.getStatus() == OrderStatus.CANCELLED ? order.getCancelledOn() : null)
                .build();

        return GettingStartedResponse.builder()
                .currentStep(currentStep)
                .assessment(assessmentDetails)
                .caseSubmittedAt(order != null ? order.getCreatedAt() : null)
                .orderId(order != null ? order.getId() : draftOrder != null ? draftOrder.getId() : null)
                .orderStatus(order != null ? order.getStatus() : draftOrder != null ? OrderStatus.DRAFT : null)
                .inPlanning(null)
                .inManufacturing(null)
                .inTransit(null)
                .startingSoon(null)
                .invitedPatient(anyInvitationBeenSent)
                .treatmentPlanId(treatmentPlan != null ? treatmentPlan.getId() : null)
                .build();
    }

    private GettingStartedResponse getPlanning(
            GettingStartedDetailsRequest request,
            boolean anyInvitationBeenSent,
            Order order,
            GettingStartedFilter currentStep,
            OrderSummary purchaseOrder) {
        List<TreatmentPlan> treatmentPlans = treatmentPlanRepository.findTreatmentPlansByPatientIdWithProfileId(
                request.getPatientId(), request.getProfileId());

        List<TreatmentPlan> latestTreatmentPlain = treatmentPlanRepository.findAllByOrderId(order.getId());
        var latestTreatmentPlainStatus =
                GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.AWAITING_TREATMENT_PLAN;
        if (latestTreatmentPlain != null && !latestTreatmentPlain.isEmpty()) {
            latestTreatmentPlainStatus = determineTreatmentPlanStatus(latestTreatmentPlain.get(0));
        }

        if (treatmentPlans == null || treatmentPlans.isEmpty()) {
            return createInPlanningResponse(
                    GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.AWAITING_TREATMENT_PLAN,
                    null,
                    anyInvitationBeenSent,
                    order,
                    currentStep,
                    purchaseOrder,
                    latestTreatmentPlainStatus);
        }

        GettingStartedResponse.InPlanningDetails.ActiveTreatmentPlan activeTreatmentPlan = treatmentPlans.stream()
                .filter(tp -> tp.getStatus() == AlignerTreatmentStatus.ACTIVE
                        || tp.getStatus() == AlignerTreatmentStatus.PAUSED)
                .findFirst()
                .map(GettingStartedResponse.InPlanningDetails.ActiveTreatmentPlan::fromActiveTreatmentPlan)
                .orElse(null);

        GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus status = treatmentPlans.stream()
                .map(this::determineTreatmentPlanStatus)
                .max(Comparator.comparingInt(this::getStatusPriority))
                .orElse(GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.AWAITING_TREATMENT_PLAN);

        return createInPlanningResponse(
                status,
                activeTreatmentPlan,
                anyInvitationBeenSent,
                order,
                currentStep,
                purchaseOrder,
                latestTreatmentPlainStatus);
    }

    private GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus determineTreatmentPlanStatus(
            TreatmentPlan treatmentPlan) {
        if (treatmentPlan.getTracking() != null) {
            return GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.FINALIZED;
        }

        if (treatmentPlan.getStatus() == AlignerTreatmentStatus.ACTIVE) {
            return GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.ACTIVE;
        }

        if (treatmentPlan.getStatus() == AlignerTreatmentStatus.DRAFT) {

            Boolean isApprovedByPatient = treatmentPlan.getIsApprovedByPatient();
            LocalDate approvedByPatientAt = treatmentPlan.getApprovedByPatientAt();

            if (isApprovedByPatient != null && approvedByPatientAt != null) {
                return GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.APPROVED_BY_PATIENT;
            } else if (isApprovedByPatient == null && approvedByPatientAt != null) {
                return GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.SENT_TO_PATIENT;
            }
        }
        OrderTreatmentPlanStatus approverStatus = treatmentPlan.getApproverStatus();
        if (treatmentPlan.getStatus() == AlignerTreatmentStatus.DRAFT) {
            if (approverStatus == null) {
                return GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.AWAITING_TREATMENT_PLAN;
            }
            return mapToResponseStatus(approverStatus);
        }
        if (treatmentPlan.getStatus() == AlignerTreatmentStatus.DEACTIVATED) {
            return GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.DEACTIVATED;
        }
        return mapToResponseStatus(approverStatus);
    }

    private int getStatusPriority(GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus status) {
        return switch (status) {
            case DEACTIVATED -> 0;
            case AWAITING_TREATMENT_PLAN -> 1;
            case RE_PLAN -> 2;
            case AWAITING_APPROVAL -> 3;
            case APPROVED -> 4;
            case SENT_TO_PATIENT -> 5;
            case APPROVED_BY_PATIENT -> 6;
            case ACTIVE -> 7;
            case FINALIZED -> 8;
        };
    }

    private GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus mapToResponseStatus(
            OrderTreatmentPlanStatus approverStatus) {
        return switch (approverStatus) {
            case APPROVED -> GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.APPROVED;
            case PENDING_APPROVAL -> GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.AWAITING_APPROVAL;
            case RE_PLAN -> GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.RE_PLAN;
            default -> GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus.AWAITING_TREATMENT_PLAN;
        };
    }

    private int getStatusPriority(OrderTreatmentPlanStatus status) {
        return switch (status) {
            case APPROVED -> 0;
            case PENDING_APPROVAL -> 1;
            default -> Integer.MAX_VALUE;
        };
    }

    private GettingStartedResponse createInPlanningResponse(
            GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus status,
            GettingStartedResponse.InPlanningDetails.ActiveTreatmentPlan activePlan,
            boolean isInvitationSent,
            Order order,
            GettingStartedFilter currentStep,
            OrderSummary purchaseOrder,
            GettingStartedResponse.InPlanningDetails.TreatmentPlanStatus latestTreatmentPlainStatus) {
        var planningDetails = GettingStartedResponse.InPlanningDetails.builder()
                .purchaseOrderId(purchaseOrder != null ? purchaseOrder.getOrderId() : null)
                .purchaseOrderStatus(purchaseOrder != null ? purchaseOrder.getOrderStatus() : null)
                .purchaseOrderTreatmentPlanCount(purchaseOrder != null ? purchaseOrder.getTreatmentPlanCount() : 0)
                .activeTreatmentPlan(activePlan)
                .treatmentPlanStatus(status)
                .cancelledOn(
                        order != null && order.getStatus() == OrderStatus.CANCELLED ? order.getCancelledOn() : null)
                .build();

        return GettingStartedResponse.builder()
                .currentStep(currentStep)
                .orderStatus(order != null ? order.getStatus() : null)
                .orderId(order != null ? order.getId() : null)
                .invitedPatient(isInvitationSent)
                .caseSubmittedAt(order != null ? order.getCreatedAt() : null)
                .inPlanning(planningDetails)
                .treatmentPlanId(activePlan != null ? activePlan.getTreatmentPlanId() : null)
                .latestOrderTreatmentPlanStatus(latestTreatmentPlainStatus)
                .build();
    }

    private GettingStartedResponse getInManufacturing(
            boolean anyInvitationBeenSent,
            Order order,
            GettingStartedFilter currentStep,
            @Nullable TreatmentPlan treatmentPlan) {

        if (treatmentPlan == null) {
            throw new TreatmentNotFoundException();
        }
        var manufacturingBatches = treatmentPlan.getManufacturingBatches();

        List<ManufacturingDetails> manufacturingDetailsList =
                manufacturingBatches.stream().map(ManufacturingDetails::from).collect(Collectors.toList());

        var activeTreatmentPlan =
                GettingStartedResponse.InManufacturingDetails.ActiveTreatmentPlan.fromActiveTreatmentPlan(
                        treatmentPlan);

        GettingStartedResponse.InManufacturingDetails.ShippingDetailsInfo shippingDetails = null;
        if (order != null && order.getShippingDetails() != null) {
            var shipping = order.getShippingDetails();
            shippingDetails = GettingStartedResponse.InManufacturingDetails.ShippingDetailsInfo.builder()
                    .addressedTo(shipping.getAddressedTo())
                    .name(shipping.getName())
                    .addressLine(shipping.getAddressLine())
                    .city(shipping.getCity())
                    .state(shipping.getState())
                    .country(shipping.getCountry())
                    .pincode(shipping.getPincode())
                    .isDefault(shipping.isDefault())
                    .build();
        }
        var totalAligner = treatmentPlan.getManufacturingBatches() != null
                ? TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan)
                : null;

        var unprocessedAlignerDetails = totalAligner != null && treatmentPlan.getManufacturingBatches() != null
                ? ManufacturingBatch.calculatePendingAligners(totalAligner, treatmentPlan.getManufacturingBatches())
                : null;

        var inManufacturingDetails = GettingStartedResponse.InManufacturingDetails.builder()
                .deliveryPreference(order != null ? order.getDeliveryPreference() : null)
                .manufacturingDetailsList(manufacturingDetailsList)
                .activeTreatmentPlan(activeTreatmentPlan)
                .shippingDetails(shippingDetails)
                .unprocessedAlignerDetails(unprocessedAlignerDetails)
                .deliveredAlignerDetails(
                        treatmentPlan.getManufacturingBatches() != null
                                ? ManufacturingBatch.calculateDeliveredAligners(treatmentPlan.getManufacturingBatches())
                                : null)
                .build();

        return GettingStartedResponse.builder()
                .currentStep(currentStep)
                .orderStatus(order != null ? order.getStatus() : null)
                .orderId(order != null ? order.getId() : null)
                .assessment(null)
                .inPlanning(null)
                .inManufacturing(inManufacturingDetails)
                .inTransit(null)
                .startingSoon(null)
                .invitedPatient(anyInvitationBeenSent)
                .caseSubmittedAt(order != null ? order.getCreatedAt() : null)
                .treatmentPlanId(treatmentPlan.getId())
                .build();
    }

    private GettingStartedResponse getInTransit(
            boolean anyInvitationBeenSent,
            Order order,
            GettingStartedFilter currentStep,
            @Nullable TreatmentPlan treatmentPlan) {

        if (treatmentPlan == null) {
            throw new TreatmentNotFoundException();
        }
        var manufacturingBatches = treatmentPlan.getManufacturingBatches();

        var latestBatch = manufacturingBatches.stream()
                .filter(batch -> batch.getStatus() == ManufacturingStatus.SHIPPED
                        || batch.getStatus() == ManufacturingStatus.DELIVERED)
                .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                .orElse(null);

        GettingStartedResponse.InTransitDetails inTransitDetails = null;

        if (latestBatch != null) {
            List<FileDetails> documents =
                    latestBatch.getFiles().stream().map(FileDetails::from).collect(Collectors.toList());

            var shippingInfo = GettingStartedResponse.InTransitDetails.ShippingInfo.builder()
                    .trackingLink(latestBatch.getTrackingLink())
                    .trackingNumber(latestBatch.getTrackingNumber())
                    .shippingDate(
                            latestBatch.getShippingDate() != null
                                    ? latestBatch.getShippingDate().toString()
                                    : null)
                    .tentativeDate(
                            latestBatch.getTentativeDeliveryDate() != null
                                    ? latestBatch.getTentativeDeliveryDate().toString()
                                    : null)
                    .documents(documents)
                    .build();

            inTransitDetails = GettingStartedResponse.InTransitDetails.builder()
                    .manufacturingId(latestBatch.getId())
                    .manufacturingStatus(latestBatch.getStatus().toString())
                    .deliveryDate(latestBatch.getDeliveryDate())
                    .shippingDetails(shippingInfo)
                    .build();
        }

        return GettingStartedResponse.builder()
                .currentStep(currentStep)
                .orderStatus(order != null ? order.getStatus() : null)
                .orderId(order != null ? order.getId() : null)
                .assessment(null)
                .inPlanning(null)
                .inManufacturing(null)
                .inTransit(inTransitDetails)
                .startingSoon(null)
                .invitedPatient(anyInvitationBeenSent)
                .caseSubmittedAt(order != null ? order.getCreatedAt() : null)
                .treatmentPlanId(treatmentPlan.getId())
                .build();
    }

    private GettingStartedResponse getStartingSoon(
            boolean anyInvitationBeenSent,
            Order order,
            GettingStartedFilter currentStep,
            Long userProfileId,
            TreatmentPlan treatmentPlan) {

        if (treatmentPlan == null) {
            throw new TreatmentNotFoundException();
        }
        var reminders = reminderRepository.findByUserProfileIdAndPurposeAndAddedForUserId(
                userProfileId,
                ReminderPurpose.TREATMENT_START_REMINDER,
                treatmentPlan.getPatient().getId());

        var latestReminder = reminders.stream()
                .max(Comparator.comparing(Reminder::getId)
                        .thenComparing(Reminder::getTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);

        var isTreatmentFinalised = treatmentPlan.getIsTreatmentFinalised();
        var startingSoonDetails = GettingStartedResponse.StartingSoonDetails.builder()
                .isTreatmentStarted(isTreatmentFinalised)
                .reminderDate(latestReminder != null ? latestReminder.getDate() : null)
                .treatmentPlanId(treatmentPlan.getId())
                .build();
        return GettingStartedResponse.builder()
                .currentStep(currentStep)
                .orderStatus(order != null ? order.getStatus() : null)
                .orderId(order != null ? order.getId() : null)
                .assessment(null)
                .inPlanning(null)
                .inManufacturing(null)
                .inTransit(null)
                .startingSoon(startingSoonDetails)
                .invitedPatient(anyInvitationBeenSent)
                .caseSubmittedAt(order != null ? order.getCreatedAt() : null)
                .treatmentPlanId(treatmentPlan.getId())
                .build();
    }

    private boolean isAlignerCompanyOrLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ALIGNER_COMPANY_OR_LAB.name()));
    }
}
