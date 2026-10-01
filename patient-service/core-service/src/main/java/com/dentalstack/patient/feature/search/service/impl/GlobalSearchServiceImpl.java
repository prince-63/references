package com.dentalstack.patient.feature.search.service.impl;

import com.dentalstack.patient.feature.doctor.dto.PracticeLocationDetails;
import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.DoctorPracticeLocationRepository;
import com.dentalstack.patient.feature.doctorinvitation.repository.DoctorInvitationRepository;
import com.dentalstack.patient.feature.doctorinvitation.summary.DoctorInvitationSearchProjection;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.search.controller.v2.GlobalSearchRequest;
import com.dentalstack.patient.feature.search.dto.search.*;
import com.dentalstack.patient.feature.search.projection.GlobalSearchLeadProjection;
import com.dentalstack.patient.feature.search.service.GlobalSearchService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class GlobalSearchServiceImpl implements GlobalSearchService {

    private final PatientRepository patientRepository;
    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final DoctorPracticeLocationRepository doctorPracticeLocationRepository;
    private final DoctorInvitationRepository doctorInvitationRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrderRepository orderRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final ManufacturingRepository manufacturingRepository;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final VspOrderRepository vspOrderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GlobalSearchResult> search(String query, Long doctorId, Long organizationId, boolean isOrgAdmin) {
        var results = new ArrayList<GlobalSearchResult>();

        List<Long> mappedPatientIds;
        Long orgProfileId;

        var userProfileId = userProfileRepository
                .findUserProfileIdByDoctorIdAndOrganizationIdForSearch(doctorId, organizationId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(userProfileId);

        if (isAdminWithDefaultTag) {
            return getAdminWithDefaultTagSearchResults(query, doctorId, organizationId, userProfileId);
        }

        if (isOrgAdmin) {
            orgProfileId = userProfileRepository
                    .findUserProfileIdByDoctorIdAndOrganizationIdForSearch(doctorId, organizationId)
                    .orElseThrow(() -> new DoctorNotFoundException(doctorId));

            mappedPatientIds = orderRepository.findPatientIdByAssignedLabUserId(orgProfileId);

            mappedPatientIds.addAll(patientDoctorOrganizationRepository.findPatientIdsByOrganizationId(organizationId));
            mappedPatientIds = mappedPatientIds.stream().distinct().collect(Collectors.toList());

        } else {
            orgProfileId = null;
            mappedPatientIds =
                    patientDoctorOrganizationRepository
                            .findByDoctorIdAndOrganizationId(doctorId, organizationId)
                            .stream()
                            .map(pdo -> pdo.getPatient().getId())
                            .collect(Collectors.toList());
        }

        List<Patient> patients =
                patientRepository.findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedId(query, mappedPatientIds);
        if (!patients.isEmpty()) {
            patients.forEach(
                    p -> results.add(new PatientDetailsSearchResult(PatientDetails.searchfrom(p, orgProfileId))));
        }

        List<GlobalSearchLeadProjection> patientInvitationDetails =
                patientInvitationDetailsRepository.findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedId(
                        query, mappedPatientIds);
        if (!patientInvitationDetails.isEmpty()) {
            patientInvitationDetails.forEach(pl -> results.add(new PatientLeadDetailsSearchResult(pl)));
        }

        List<PracticeLocation> practiceLocations =
                doctorPracticeLocationRepository.findByQueryAndDoctorId(query, doctorId, organizationId);
        if (!practiceLocations.isEmpty()) {
            practiceLocations.forEach(
                    pl -> results.add(new PracticeLocationSearchResult(PracticeLocationDetails.searchfrom(pl))));
        }

        List<DoctorInvitationSearchProjection> doctorInvitations =
                doctorInvitationRepository.searchAcceptedInvitations(userProfileId, doctorId, organizationId, query);
        if (!doctorInvitations.isEmpty()) {
            doctorInvitations.forEach(di -> results.add(new DoctorInvitationSearchResult(di)));
        }

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GlobalSearchResult> searchV2(GlobalSearchRequest request) {
        var results = new ArrayList<GlobalSearchResult>();
        var query = request.getQuery();

        var userProfile = loadAndValidateUserProfile(request);

        var enabledItems = new HashSet<>(serviceConfigurationRepository.findEnabledItemNames(userProfile.getId()));

        var mappedPatientIds = collectPatientIds(userProfile, query, enabledItems);

        searchAndAddPatients(query, mappedPatientIds, results);

        searchAndAddPracticeLocations(query, request.getDoctorId(), request.getOrganizationId(), results);

        searchAndAddDoctorInvitations(
                userProfile.getId(), request.getDoctorId(), request.getOrganizationId(), query, results);

        return results;
    }

    private UserProfile loadAndValidateUserProfile(GlobalSearchRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (userProfile.isOwner()) {
            return userProfile;
        } else {
            return userProfile.getInviterProfile();
        }
    }

    private Set<Long> collectPatientIds(UserProfile userProfile, String query, Set<String> enabledItems) {
        var patientIds = new HashSet<Long>();

        if (userProfile.isPractice() || userProfile.isInHouseManufacturingLab() || userProfile.isStarter()) {
            patientIds.addAll(patientDoctorOrganizationRepository.customerPatientIds(userProfile.getId(), query));
        } else if (userProfile.isEnterprise()) {
            collectEnterprisePatientIds(userProfile.getId(), query, enabledItems, patientIds);
        } else if (userProfile.isInternalUser()) {
            patientIds.addAll(patientTaskTrackerRepository.findPatientIdsByAssignee(userProfile.getId(), query));
        }

        return patientIds;
    }

    private void collectEnterprisePatientIds(
            Long profileId, String query, Set<String> enabledItems, Set<Long> patientIds) {
        boolean hasManufacturing = enabledItems.contains("MANUFACTURING");
        boolean hasPlanning = enabledItems.contains("PLANNING");
        boolean hasVspPlanning = enabledItems.contains("VSP PLANNING");

        if (hasManufacturing) {
            patientIds.addAll(manufacturingRepository.findPatientIdsByOutsourcedProfile(profileId, query));
        } else if (hasPlanning) {
            patientIds.addAll(orderRepository.findPatientIdByAssignedLabUserIdWithSearch(profileId, query));
        } else if (hasVspPlanning) {
            patientIds.addAll(vspOrderRepository.findPatientIdByAssignedLabUserIdWithSearch(profileId, query));
        } else {
            patientIds.addAll(manufacturingRepository.findPatientIdsByOutsourcedProfile(profileId, query));
            patientIds.addAll(orderRepository.findPatientIdByAssignedLabUserIdWithSearch(profileId, query));
            patientIds.addAll(
                    patientDoctorOrganizationRepository.orgPatientAddedByCustomerPatientIds(profileId, query));
        }
    }

    private void searchAndAddPatients(String query, Set<Long> mappedPatientIds, List<GlobalSearchResult> results) {
        var patients = patientRepository.findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedId(
                query, new ArrayList<>(mappedPatientIds));

        patients.stream()
                .map(p -> new PatientDetailsSearchResult(PatientDetails.searchfrom(p, null)))
                .forEach(results::add);
    }

    private void searchAndAddPracticeLocations(
            String query, Long doctorId, Long organizationId, List<GlobalSearchResult> results) {
        var locations = doctorPracticeLocationRepository.findByQueryAndDoctorId(query, doctorId, organizationId);

        locations.stream()
                .map(pl -> new PracticeLocationSearchResult(PracticeLocationDetails.searchfrom(pl)))
                .forEach(results::add);
    }

    private void searchAndAddDoctorInvitations(
            Long profileId, Long doctorId, Long organizationId, String query, List<GlobalSearchResult> results) {
        var invitations =
                doctorInvitationRepository.searchAcceptedInvitations(profileId, doctorId, organizationId, query);

        invitations.stream().map(DoctorInvitationSearchResult::new).forEach(results::add);
    }

    private List<GlobalSearchResult> getAdminWithDefaultTagSearchResults(
            String query, Long doctorId, Long organizationId, Long userProfileId) {

        var results = new ArrayList<GlobalSearchResult>();

        List<Long> mappedPatientIds;
        Long orgProfileId;
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(userProfileId)
                .orElseThrow(() -> new DoctorNotFoundException(userProfileId));

        if (userProfile.getInviterProfile() != null) {
            var inviterProfile = userProfile.getInviterProfile();
            doctorId = inviterProfile.getDoctor().getId();
            organizationId = inviterProfile.getOrganization().getId();
        }
        Long finalDoctorId = doctorId;
        orgProfileId = userProfileRepository
                .findUserProfileIdByDoctorIdAndOrganizationIdForSearch(doctorId, organizationId)
                .orElseThrow(() -> new DoctorNotFoundException(finalDoctorId));

        mappedPatientIds = orderRepository.findPatientIdByAssignedLabUserId(orgProfileId);

        mappedPatientIds.addAll(patientDoctorOrganizationRepository.findPatientIdsByOrganizationId(organizationId));
        mappedPatientIds = mappedPatientIds.stream().distinct().collect(Collectors.toList());

        List<Patient> patients =
                patientRepository.findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedId(query, mappedPatientIds);
        if (!patients.isEmpty()) {
            patients.forEach(
                    p -> results.add(new PatientDetailsSearchResult(PatientDetails.searchfrom(p, orgProfileId))));
        }

        List<GlobalSearchLeadProjection> patientInvitationDetails =
                patientInvitationDetailsRepository.findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedId(
                        query, mappedPatientIds);
        if (!patientInvitationDetails.isEmpty()) {
            patientInvitationDetails.forEach(pl -> results.add(new PatientLeadDetailsSearchResult(pl)));
        }

        List<PracticeLocation> practiceLocations =
                doctorPracticeLocationRepository.findByQueryAndDoctorId(query, doctorId, organizationId);
        if (!practiceLocations.isEmpty()) {
            practiceLocations.forEach(
                    pl -> results.add(new PracticeLocationSearchResult(PracticeLocationDetails.searchfrom(pl))));
        }

        return results;
    }
}
