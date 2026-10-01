package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.feature.doctor.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctor.repository.InvitationRepository;
import com.dentalstack.patient.feature.patient.entity.Invitation;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.patient.enums.PendingActionEnum;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.treatment.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.treatment.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.enums.UserType;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorDashboardServiceImpl implements DoctorDashboardService {

    private final DoctorService doctorService;

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final InvitationRepository invitationRepository;
    private final BracesJourneyRepository bracesJourneyRepository;

    private final TreatmentPlanRepository treatmentPlanRepository;
    private final TrackingRepository trackingRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    private final UserProfileRepository userProfileRepository;

    // v2

    private boolean isPendingAction(
            PendingActionEnum action,
            Patient patient,
            Set<Long> patientsWithActiveTracking,
            Set<Long> patientsWithTreatmentPlans,
            Set<Long> patientsWithManualTracking,
            List<Invitation> invitations) {
        return switch (action) {
            case ADD_TREATMENT -> needsTreatment(patient);
            case SET_UP_TREATMENT_PLAN -> needsTreatmentPlan(patient, patientsWithTreatmentPlans);
            case ADD_TRACKING -> needsTracking(patient, patientsWithActiveTracking, patientsWithTreatmentPlans);
            case CONNECT_WITH_PATIENT -> needsConnection(
                    patient,
                    patientsWithActiveTracking,
                    patientsWithTreatmentPlans,
                    patientsWithManualTracking,
                    invitations);
        };
    }

    @Override
    public Map<PendingActionEnum, Integer> getPendingActionCounts(Long doctorId) {
        Map<PendingActionEnum, Integer> actionCounts = new EnumMap<>(PendingActionEnum.class);
        for (PendingActionEnum action : PendingActionEnum.values()) {
            actionCounts.put(action, 0);
        }

        List<InvitationStatus> statusList = List.of(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
                        doctorId, UserType.DOCTOR, UserType.PATIENT, statusList);

        if (invitations.isEmpty()) {
            return actionCounts;
        }

        List<Long> patientIds = invitations.stream()
                .map(Invitation::getPatientInvitation)
                .filter(Objects::nonNull)
                .map(PatientInvitationDetails::getPatient)
                .filter(Objects::nonNull)
                .map(Patient::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (patientIds.isEmpty()) {
            return actionCounts;
        }

        List<Status> statuses = Arrays.asList(Status.ACTIVE, Status.PAUSED);
        Set<Long> patientsWithActiveTracking =
                new HashSet<>(trackingRepository.findPatientIdsWithActiveTrackingByStatuses(statuses, patientIds));
        Set<Long> patientsActiveWithTreatmentPlans =
                new HashSet<>(treatmentPlanRepository.findPatientIdsWithTreatmentPlansByStatus(
                        doctorId, patientIds, AlignerTreatmentStatus.ACTIVE));
        Set<Long> patientsWithManualTracking =
                new HashSet<>(trackingRepository.findPatientIdsWithTrackingType(TrackingType.MANUAL, patientIds));

        for (Invitation invitation : invitations) {
            PatientInvitationDetails patientInvitation = invitation.getPatientInvitation();
            if (patientInvitation == null) {
                continue;
            }

            Patient patient = patientInvitation.getPatient();
            if (patient == null) {
                continue;
            }

            for (PendingActionEnum action : PendingActionEnum.values()) {
                if (isPendingAction(
                        action,
                        patient,
                        patientsWithActiveTracking,
                        patientsActiveWithTreatmentPlans,
                        patientsWithManualTracking,
                        invitations)) {
                    actionCounts.put(action, actionCounts.get(action) + 1);
                }
            }
        }

        return actionCounts;
    }

    private boolean needsTreatment(Patient patient) {
        List<ProductTypeName> productTypeNames = patient.getProductTypeNames();
        return productTypeNames.size() == 1 && productTypeNames.contains(ProductTypeName.UNASSIGNED);
    }

    private boolean needsTreatmentPlan(Patient patient, Set<Long> patientsWithTreatmentPlans) {
        List<ProductTypeName> productTypeNames = patient.getProductTypeNames();

        boolean hasOnlyUnassignedAndBraces = productTypeNames.size() == 2
                && productTypeNames.contains(ProductTypeName.UNASSIGNED)
                && productTypeNames.contains(ProductTypeName.BRACES);

        boolean hasTreatment = productTypeNames.stream().anyMatch(type -> type != ProductTypeName.UNASSIGNED);

        return hasTreatment && !hasOnlyUnassignedAndBraces && !patientsWithTreatmentPlans.contains(patient.getId());
    }

    private boolean needsTracking(
            Patient patient, Set<Long> patientsWithActiveTracking, Set<Long> patientsWithTreatmentPlans) {
        List<ProductTypeName> productTypeNames = patient.getProductTypeNames();
        boolean hasTreatment = !(productTypeNames.size() == 1 && productTypeNames.contains(ProductTypeName.UNASSIGNED));
        return hasTreatment
                && patientsWithTreatmentPlans.contains(patient.getId())
                && !patientsWithActiveTracking.contains(patient.getId());
    }

    private boolean needsConnection(
            Patient patient,
            Set<Long> patientsWithActiveTracking,
            Set<Long> patientsWithTreatmentPlans,
            Set<Long> patientsWithManualTracking,
            List<Invitation> invitations) {
        boolean hasTracking = patientsWithActiveTracking.contains(patient.getId());
        boolean hasTreatment = !(patient.getProductTypeNames().size() == 1
                && patient.getProductTypeNames().contains(ProductTypeName.UNASSIGNED));
        boolean hasTreatmentPlan = patientsWithTreatmentPlans.contains(patient.getId());
        boolean hasManualTracking = patientsWithManualTracking.contains(patient.getId());

        return hasTreatment
                && hasTracking
                && hasTreatmentPlan
                && !hasManualTracking
                && invitations.stream()
                        .filter(invitation -> invitation.getPatientInvitation() != null
                                && invitation.getPatientInvitation().getPatient() != null
                                && invitation
                                                .getPatientInvitation()
                                                .getPatient()
                                                .getId()
                                        != null
                                && invitation
                                        .getPatientInvitation()
                                        .getPatient()
                                        .getId()
                                        .equals(patient.getId()))
                        .anyMatch(invitation -> invitation.getStatus() == InvitationStatus.SENT);
    }
}
