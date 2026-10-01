package com.dentalstack.patient.feature.doctor.service.impl;

import com.dentalstack.patient.feature.doctor.client.DoctorServiceClient;
import com.dentalstack.patient.feature.doctor.dto.*;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.invitation.dto.PatientInvitationRequest;
import com.dentalstack.patient.feature.invitation.dto.PatientInvitationSendRequest;
import com.dentalstack.patient.feature.invitation.enums.Status;
import com.dentalstack.patient.feature.order.projection.OrderDetailsProjection;
import com.dentalstack.patient.feature.order.repository.PatientsOrderDetailsRepository;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientListCountRepository;
import com.dentalstack.patient.feature.sampledata.dto.GenerateSampleDoctorRequest;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionUserMapping;
import com.dentalstack.patient.feature.subcription.exception.SubscriptionNotFoundException;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionRepository;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.utils.InternalUserProfileUtil;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorServiceClient doctorServiceClient;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final PatientsOrderDetailsRepository patientsOrderDetailsRepository;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final PatientListCountRepository patientListCountRepository;

    @Override
    public DoctorDetails getDoctor(Long doctorId) {
        return doctorServiceClient.getDoctorDetail(doctorId);
    }

    @Override
    public void registerPatientInvitation(PatientInvitationRequest request) {
        doctorServiceClient.patientInvitationSend(PatientInvitationSendRequest.from(request));
    }

    @Override
    public void patientInvitationStatusChanged(long doctorId, long patientId, Status status) {
        doctorServiceClient.changePatientInvitationStatus(
                new ChangePatientInvitationStatusRequest(doctorId, patientId, status));
    }

    @Override
    public Long getPracticeLocationCount(long doctorId) {
        return doctorServiceClient.getCountOfLocation(doctorId);
    }

    @Override
    public PracticeLocationDetails getPracticeLocation(Long patientId) {
        return doctorServiceClient.getPracticeLocation(patientId);
    }

    @Override
    public List<PLOfPatientResponse> getPracticeLocationOfPatient(List<Long> patientId) {
        return doctorServiceClient.getPracticeLocationOfPatient(patientId);
    }

    @Override
    public List<PLOfPatientResponse> getPracticeLocationOfPatientForFilter(List<Long> patientId) {
        return doctorServiceClient.getPracticeLocationOfPatientFilter(patientId);
    }

    @Override
    public PLOfPatientResponse getPracticeLocationOfPatient(Long patientId) {
        return doctorServiceClient.getIndividualClinic(patientId);
    }

    @Override
    public String getPendingInviteDetails(Long patientId, Long doctorId) {
        return doctorServiceClient.getPendingInviteDetails(patientId, doctorId);
    }

    @Override
    public DoctorDetails getSampleDoctor(Long patientId, Long alignerJourneyId) {
        return doctorServiceClient.getSampleDoctor(new GenerateSampleDoctorRequest(patientId, alignerJourneyId));
    }

    @Override
    public DoctorDetails doctorDetailsForPatient(Long doctorId, Long patientId) {
        return doctorServiceClient.doctorDetailsForPatient(doctorId, patientId);
    }

    @Override
    public String assignPracticeLocationToPatientForApp(
            AssignPracticeLocationToPatientRequest assignPracticeLocationToPatientRequest) {
        return doctorServiceClient.assignPracticeLocationToPatientForApp(assignPracticeLocationToPatientRequest);
    }

    @Override
    public DoctorDetails getDoctorByEmail(String emailId) {
        return doctorServiceClient.getDoctorByEmail(emailId);
    }

    @Override
    public void removePatientPractice(Long patientId) {
        doctorServiceClient.removePatientPractice(patientId);
    }

    @Override
    public DoctorInvitationCountDetails getInvitationCountOfAllRoles(DoctorInvitationCountRequest request) {
        return doctorServiceClient.getInvitationCountOfAllRoles(request);
    }

    @Override
    public void deactivateSubscription(DeactivateSubscription request) {
        Optional<SubscriptionUserMapping> subscriptionUserMapping =
                subscriptionUserMappingRepository.findByUserProfileId(request.getProfileId());
        if (subscriptionUserMapping.isPresent()) {
            subscriptionUserMapping.get().getSubscriptionPlan().setRequestedForDeactivation(true);

            subscriptionRepository.save(subscriptionUserMapping.get().getSubscriptionPlan());
        } else {
            throw new SubscriptionNotFoundException(request.getProfileId());
        }
    }

    @Override
    public MiniDashboardDetailsResponse getMiniDashboardDetails(MiniDashboardRequest request) {
        var ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var customerProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getCustomerProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getCustomerProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && ownerProfile.getInviterProfile() != null) {
            ownerProfile = ownerProfile.getInviterProfile();
            updateToOwnerProfile(ownerProfile, request);
        }

        List<Long> internalUserProfileIds =
                new ArrayList<>(InternalUserProfileUtil.getInternalUserProfileIds(ownerProfile, userProfileRepository));
        if (ownerProfile.getSubRole() != null && ownerProfile.isEnterpriseOrDesignLab()) {
            internalUserProfileIds =
                    userProfileRepository.findInvitedInternalUserProfileIdsByInviter(ownerProfile.getId());
            internalUserProfileIds.add(ownerProfile.getId());
        }
        internalUserProfileIds.add(ownerProfile.getId());

        List<OrderDetailsProjection> orderDetailsProjections = new ArrayList<>();

        if (ownerProfile.isInternalUser()) {
            if (ownerProfile.getInviterProfile() != null) {
                var inviterProfileId = ownerProfile.getInviterProfile().getId();
                if (!internalUserProfileIds.contains(inviterProfileId)) {
                    internalUserProfileIds.add(inviterProfileId);
                }
            }
        }

        List<OrderDetailsProjection> sentOrders =
                patientsOrderDetailsRepository.findSentOrdersByProfileIdWithCustomerProfileId(
                        internalUserProfileIds, request.getCustomerProfileId());

        Long sentOrderCount =
                patientsOrderDetailsRepository.countSentOrdersByProfileIdForCustomerWithInternalProfileIds(
                        internalUserProfileIds, request.getCustomerProfileId());

        Long receivedOrderCount =
                patientsOrderDetailsRepository.countReceivedOrdersByProfileIdForCustomerWithInternalIds(
                        internalUserProfileIds, request.getCustomerProfileId());

        List<OrderDetailsProjection> receivedOrders =
                patientsOrderDetailsRepository.findReceivedOrdersByProfileIdAndPatientId(
                        internalUserProfileIds, request.getCustomerProfileId());

        Long totalOrderCount =
                (sentOrderCount != null ? sentOrderCount : 0L) + (receivedOrderCount != null ? receivedOrderCount : 0L);
        orderDetailsProjections.addAll(sentOrders);
        orderDetailsProjections.addAll(receivedOrders);

        LocalDateTime lastOrderAt = orderDetailsProjections.stream()
                .map(OrderDetailsProjection::getCreatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        Long patientCounts = 0L;
        if (request.getUserType() != null) {
            switch (request.getUserType()) {
                case "PLANNING" -> {
                    patientCounts =
                            patientDoctorOrganizationRepository.countDistinctPatientsByDoctorProfilesWithCustomerId(
                                    request.getCustomerProfileId(), request.getProfileId());
                }
                case "CUSTOMER" -> {
                    patientCounts = getPatientCount(
                            ownerProfile.getOrganization().getId(),
                            request.getCustomerProfileId(),
                            customerProfile.getDoctor().getId());
                }
            }
        }

        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                        request.getCustomerProfileId(),
                        ownerProfile.getOrganization().getId());
        MiniDashboardDetailsResponse response = MiniDashboardDetailsResponse.builder()
                .lastOrderAt(lastOrderAt)
                .totalCustomerOrders(totalOrderCount)
                .totalPatients(patientCounts)
                .build();

        customerAccessAndRevoke.ifPresent(c -> {
            response.setCustomerTrackingEnabled(c.getIsTrackingEnabled());
            response.setCustomerStlFileViewEnabled(c.getIsStlFileViewEnabled());
            response.setCustomerPrintFileViewEnabled(c.getIsPrintFileViewEnabled());
            response.setCustomerScanFileViewEnabled(c.getIsScanFileViewEnabled());
        });

        return response;
    }

    @Override
    public MiniDashboardDetailsResponse getMiniDashboardDetailsForCustomer(MiniDashboardRequestForCustomer request) {
        var customerProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getOwnerProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getOwnerProfileId()));

        List<OrderDetailsProjection> sentOrders =
                patientsOrderDetailsRepository.findSentOrdersByProfileIdWithCustomerProfileId(
                        List.of(ownerProfile.getId()), customerProfile.getId());
        Long sentOrdersCount =
                patientsOrderDetailsRepository.countSentOrdersByProfileIdForCustomerWithInternalProfileIds(
                        List.of(ownerProfile.getId()), customerProfile.getId());
        Long totalOrderCount = (sentOrdersCount != null ? sentOrdersCount : 0L);

        LocalDateTime lastOrderAt = sentOrders.stream()
                .map(OrderDetailsProjection::getCreatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        Long patientCounts = 0L;
        if (request.getUserType() != null) {
            switch (request.getUserType()) {
                case "PLANNING" -> {
                    patientCounts =
                            patientDoctorOrganizationRepository.countDistinctPatientsByDoctorProfilesWithCustomerId(
                                    customerProfile.getId(), ownerProfile.getId());
                }
                case "CUSTOMER" -> {
                    patientCounts = getPatientCount(
                            ownerProfile.getOrganization().getId(),
                            customerProfile.getId(),
                            customerProfile.getDoctor().getId());
                }
            }
        }
        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                        customerProfile.getId(), ownerProfile.getOrganization().getId());
        MiniDashboardDetailsResponse response = MiniDashboardDetailsResponse.builder()
                .lastOrderAt(lastOrderAt)
                .totalCustomerOrders(totalOrderCount)
                .totalPatients(patientCounts)
                .build();

        customerAccessAndRevoke.ifPresent(c -> {
            response.setCustomerTrackingEnabled(c.getIsTrackingEnabled());
            response.setCustomerStlFileViewEnabled(c.getIsStlFileViewEnabled());
            response.setCustomerPrintFileViewEnabled(c.getIsPrintFileViewEnabled());
            response.setCustomerScanFileViewEnabled(c.getIsScanFileViewEnabled());
        });

        return response;
    }

    public Long getPatientCount(Long organizationId, Long profileId, Long doctorId) {
        Long count = patientListCountRepository.getAllPatientCountForCustomer(doctorId, organizationId, profileId);
        return count != null ? count : 0L;
    }

    @Override
    public MiniDashboardDetailsResponse getMiniDashboardDetails(Long profileId, Long organizationId) {
        UserProfile requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(profileId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found: " + profileId));

        Set<String> userRoles =
                requestProfile.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        Set<String> LAB_ROLES =
                Set.of("IN_OFFICE_MANUFACTURER", "ALIGNER_COMPANY_OR_LAB", "ENTERPRISE_COMPANY_LAB", "INTERNAL_USER");
        boolean isLabRole = userRoles.stream().anyMatch(LAB_ROLES::contains);

        long totalCount = 0L;
        LocalDateTime lastOrderAt = null;

        if (isLabRole || userRoles.contains("CONSULTING_ORTHODONTIST")) {
            List<OrderDetailsProjection> dedupedOrders =
                    patientsOrderDetailsRepository.findDistinctOrdersWithLatestCreatedAt(profileId);

            if (dedupedOrders != null && !dedupedOrders.isEmpty()) {
                totalCount = dedupedOrders.size();
                lastOrderAt = dedupedOrders.get(0).getCreatedAt();
            }
        }

        Long patientCounts = patientDoctorOrganizationRepository.countDistinctPatientsByDoctorProfiles(profileId);

        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(profileId, organizationId);
        MiniDashboardDetailsResponse response = MiniDashboardDetailsResponse.builder()
                .lastOrderAt(lastOrderAt)
                .totalCustomerOrders(totalCount)
                .totalPatients(patientCounts)
                .build();

        customerAccessAndRevoke.ifPresent(c -> {
            response.setCustomerTrackingEnabled(c.getIsTrackingEnabled());
            response.setCustomerStlFileViewEnabled(c.getIsStlFileViewEnabled());
            response.setCustomerPrintFileViewEnabled(c.getIsPrintFileViewEnabled());
            response.setCustomerScanFileViewEnabled(c.getIsScanFileViewEnabled());
        });

        return response;
    }

    private void updateToOwnerProfile(UserProfile requestProfile, MiniDashboardRequest request) {
        request.setProfileId(requestProfile.getId());
    }

    @Override
    public SuperAdminResponse getSuperAdminDetails(SuperAdminRequest request) {
        UserProfile requestProfile = request.getProfileId() != null
                ? userProfileRepository
                        .findByIdWithOrgAndDoctor(request.getProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException("Doctor not found: " + request.getProfileId()))
                : userProfileRepository
                        .findLatestByDoctorId(request.getDoctorId())
                        .orElseThrow(() ->
                                new DoctorNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        if (userProfileRepository.isAdminWithDefaultTag(requestProfile.getId())
                && requestProfile.getInviterProfile() != null) {

            UserProfile inviterProfile = requestProfile.getInviterProfile();
            return SuperAdminResponse.builder()
                    .doctorId(inviterProfile.getDoctor().getId())
                    .organizationId(inviterProfile.getOrganization().getId())
                    .profileId(inviterProfile.getId())
                    .build();
        }

        return null;
    }
}
