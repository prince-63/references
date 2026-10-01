package com.dentalstack.doctor.service.invitation;

import com.dentalstack.doctor.client.AuthServiceClient;
import com.dentalstack.doctor.dto.auth.FetchLoginType;
import com.dentalstack.doctor.dto.event.DoctorInvitationRejectedEventMetadata;
import com.dentalstack.doctor.dto.invitation.*;
import com.dentalstack.doctor.dto.notification.SendNotificationRequest;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.entity.invitation.DoctorInvitationCode;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.auth.CredentialType;
import com.dentalstack.doctor.enums.event.EventType;
import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.SortOrder;
import com.dentalstack.doctor.enums.organization.ProfileType;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.invitation.DoctorInvitationAlreadyAcceptedException;
import com.dentalstack.doctor.exception.invitation.DoctorInvitationNotFoundException;
import com.dentalstack.doctor.repository.ServiceConfigurationRepository;
import com.dentalstack.doctor.repository.billing.DoctorBillingRepository;
import com.dentalstack.doctor.repository.invitation.DoctorInvitationCodeRepository;
import com.dentalstack.doctor.repository.invitation.DoctorInvitationRepository;
import com.dentalstack.doctor.repository.rbac.SubRoleRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.ChatService;
import com.dentalstack.doctor.service.PatientService;
import com.dentalstack.doctor.summary.DoctorInvitationSummary;
import com.dentalstack.doctor.summary.UserProfileSummary;
import com.dentalstack.doctor.summary.invitation.InvitationRoleCountSummary;
import com.dentalstack.doctor.summary.invitation.InvitationRolesCountSummary;
import java.time.chrono.ChronoZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Handles invitation querying, listing, counting, deactivation, rejection and reminders.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class InvitationQueryService {

    private final DoctorInvitationRepository doctorInvitationRepository;
    private final DoctorInvitationCodeRepository doctorInvitationCodeRepository;
    private final UserProfileRepository userProfileRepository;
    private final DoctorBillingRepository doctorBillingRepository;
    private final SubRoleRepository subRoleRepository;
    private final AuthServiceClient authServiceClient;
    private final ChatService chatService;
    private final PatientService patientService;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    public DoctorInvitation getDoctorInvitationDetails(String email, long organizationId, long inviterDoctorId) {
        return doctorInvitationRepository
                .findFirstByEmailAndOrganizationIdAndInviterIdAndStatusOrderByInvitedAtDesc(
                        email, organizationId, inviterDoctorId, InvitationStatus.PENDING)
                .orElseThrow(() -> new DoctorInvitationNotFoundException(email, organizationId));
    }

    @Transactional
    public DoctorInvitationDetailsWithPagination getActiveOrPendingInvitations(
            DoctorInvitationActiveOrPendingRequest request) {

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && ownerUserProfile.getInviterProfile() != null) {
            ownerUserProfile = ownerUserProfile.getInviterProfile();
            request.setProfileId(ownerUserProfile.getId());
            request.setDoctorId(ownerUserProfile.getDoctor().getId());
            request.setOrganizationId(ownerUserProfile.getOrganization().getId());
        }

        if (request.getInvitationRoles().contains(InvitationRole.LAB_STAFF)
                || request.getInvitationRoles().contains(InvitationRole.INTERNAL_USER)) {
            return getLabStaffInvitations(request);
        }

        boolean isPlanningOrProduction =
                Boolean.TRUE.equals(userProfileRepository.isInternalUserPlanningOrProduction(request.getProfileId()));

        List<DoctorInvitation> sentInvitations;
        List<DoctorInvitation> receivedInvitations;
        DoctorInvitationSummary invitationSummary;
        DoctorInvitationSummary invitationReceivedSummary;
        List<InvitationRole> invitationRole = request.getInvitationRoles();
        List<InvitationRole> inviterOwnerRoles = request.getInviterOwnerRoles();
        List<InvitationRole> receiverInvitationRoles = request.getReceiversInvitationRoles();
        // Push status filter into SQL — DB returns only matching rows (P-3/P-5 fix)
        List<InvitationStatus> statuses = resolveStatusFilter(request.getInvitationStatus());

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow();

        if (userProfile.isInternalUser()
                || userProfile.getSubRole() != null
                        && userProfile.getSubRole().isSuperAdminOfStandardPlans()
                        && !userProfile.isPractice()) {
            sentInvitations = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findBySearchByOrgAndStatuses(
                            request.getOrganizationId(), invitationRole, request.getSearch(), statuses)
                    : doctorInvitationRepository.findByOrganizationIdAndStatuses(
                            request.getOrganizationId(), invitationRole, statuses);

            List<Long> doctorIds = doctorInvitationRepository.findDoctorIdsByOrganization(request.getOrganizationId());

            receivedInvitations = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findReceivedBySearchForOrgAndStatuses(
                            doctorIds, receiverInvitationRoles, inviterOwnerRoles, request.getSearch(), statuses)
                    : doctorInvitationRepository.findReceivedByDoctorIdsForOrgAndStatuses(
                            doctorIds, receiverInvitationRoles, inviterOwnerRoles, statuses);

            invitationSummary = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findInvitationCountsBySearchByOrg(
                            request.getOrganizationId(), invitationRole, request.getSearch())
                    : doctorInvitationRepository.findInvitationCountsByOrganizationId(
                            request.getOrganizationId(), invitationRole);

            invitationReceivedSummary = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findReceivedInvitationCountsBySearchForOrg(
                            doctorIds, receiverInvitationRoles, inviterOwnerRoles, request.getSearch())
                    : doctorInvitationRepository.findReceivedInvitationCountsByDoctorIdsForOrg(
                            doctorIds, receiverInvitationRoles, inviterOwnerRoles);

        } else {
            sentInvitations = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findBySearchAndStatuses(
                            request.getDoctorId(),
                            request.getOrganizationId(),
                            invitationRole,
                            request.getSearch(),
                            statuses)
                    : doctorInvitationRepository.findByDoctorIdAndOrganizationIdAndStatuses(
                            request.getDoctorId(), request.getOrganizationId(), invitationRole, statuses);

            receivedInvitations = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findReceivedBySearchAndStatuses(
                            request.getDoctorId(),
                            receiverInvitationRoles,
                            inviterOwnerRoles,
                            request.getSearch(),
                            statuses)
                    : doctorInvitationRepository.findReceivedByDoctorIdAndStatuses(
                            request.getDoctorId(), receiverInvitationRoles, inviterOwnerRoles, statuses);

            invitationSummary = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findInvitationCountsBySearch(
                            request.getDoctorId(), request.getOrganizationId(), invitationRole, request.getSearch())
                    : doctorInvitationRepository.findInvitationCountsByDoctorIdAndOrganizationId(
                            request.getDoctorId(), request.getOrganizationId(), invitationRole);

            invitationReceivedSummary = StringUtils.hasText(request.getSearch())
                    ? doctorInvitationRepository.findReceivedInvitationCountsBySearch(
                            request.getDoctorId(), receiverInvitationRoles, inviterOwnerRoles, request.getSearch())
                    : doctorInvitationRepository.findReceivedInvitationCountsByDoctorId(
                            request.getDoctorId(), receiverInvitationRoles, inviterOwnerRoles);
        }

        // Status filtering is now done in SQL — no in-memory filter needed
        List<DoctorInvitation> invitations = new ArrayList<>(sentInvitations);
        if (receivedInvitations != null && !receivedInvitations.isEmpty()) {
            invitations.addAll(receivedInvitations);
        }

        long activeInvitationCount = 0L;
        long pendingInvitationCount = 0L;

        if (invitationSummary != null) {
            activeInvitationCount += invitationSummary.getActiveInvitationsCount();
            pendingInvitationCount += invitationSummary.getPendingInvitationsCount();
        }

        if (invitationReceivedSummary != null) {
            activeInvitationCount += invitationReceivedSummary.getActiveInvitationsCount();
            pendingInvitationCount += invitationReceivedSummary.getPendingInvitationsCount();
        }

        Stream<DoctorInvitation> sortedInvitations = invitations.stream();
        sortedInvitations = applySorting(sortedInvitations, request.getSortOrder());

        List<DoctorInvitationDetails> invitationDetails = sortedInvitations
                .map(invitation -> {
                    Optional<UserProfileSummary> userProfileView;
                    boolean isReceivedInvitation = invitation.getInvitedDoctor() != null
                            && invitation.getInvitedDoctor().getId().equals(request.getDoctorId());
                    DoctorInvitationDetails details = null;

                    if (isReceivedInvitation) {
                        var inviterUserProfile = invitation.getInviterUserProfile();
                        if (inviterUserProfile != null) {
                            userProfileView = userProfileRepository.findSummaryById(inviterUserProfile.getId());
                            if (userProfileView.isPresent()) {
                                details = DoctorInvitationDetails.receivedInvitation(invitation, userProfileView.get());
                                details.setIsReceivedInvitation(true);
                                List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(
                                        userProfileView.get().getProfileId());
                                details.setEnabledItems(enabledItems);
                            }
                        }
                    } else {
                        if (invitation.getInvitedDoctor() != null) {
                            userProfileView = userProfileRepository.findUserProfileViewByDoctorIdAndInviterProfileId(
                                    invitation.getInvitedDoctor().getId(),
                                    invitation.getInviterUserProfile().getId());

                            if (userProfileView.isPresent()) {
                                details = DoctorInvitationDetails.from(invitation, userProfileView.get());
                                details.setIsReceivedInvitation(false);
                                List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(
                                        userProfileView.get().getProfileId());
                                details.setEnabledItems(enabledItems);

                            } else {
                                var userProfilesView = userProfileRepository.findUserProfileViewByDoctorId(
                                        invitation.getInvitedDoctor().getId());
                                if (!userProfilesView.isEmpty()) {
                                    details = DoctorInvitationDetails.from(invitation, userProfilesView.get(0));
                                    details.setIsReceivedInvitation(false);
                                    List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(
                                            userProfilesView.get(0).getProfileId());
                                    details.setEnabledItems(enabledItems);
                                } else {
                                    details = DoctorInvitationDetails.from(invitation, null);
                                    details.setIsReceivedInvitation(false);
                                }
                            }

                        } else {
                            details = DoctorInvitationDetails.from(invitation, null);
                            details.setIsReceivedInvitation(false);
                        }
                    }
                    return details;
                })
                .filter(Objects::nonNull)
                .toList();

        List<DoctorInvitationDetails> allInvitationDetails = new ArrayList<>(invitationDetails);

        if (isPlanningOrProduction) {
            var adminDetails = DoctorInvitationDetails.from(userProfile, request);
            List<DoctorInvitationDetails> restrictedDetails = new ArrayList<>();
            restrictedDetails.add(adminDetails);

            if (userProfile.getInviterProfile() != null) {
                restrictedDetails.add(DoctorInvitationDetails.from(userProfile.getInviterProfile(), request));
            }

            allInvitationDetails = restrictedDetails;
        }

        DoctorInvitationDetailsWithPagination.PaginationDetails paginationDetails = null;
        List<DoctorInvitationDetails> paginatedInvitationDetails;

        if (request.getPageSize() == 0) {
            paginatedInvitationDetails = allInvitationDetails;
        } else {
            paginatedInvitationDetails =
                    getPaginatedResults(allInvitationDetails, request.getPageNumber(), request.getPageSize());

            paginationDetails = createPaginationDetails(
                    request.getPageNumber(),
                    request.getPageSize(),
                    allInvitationDetails.size(),
                    activeInvitationCount,
                    pendingInvitationCount);
        }

        return DoctorInvitationDetailsWithPagination.builder()
                .doctorInvitationDetailsList(paginatedInvitationDetails)
                .pagination(paginationDetails)
                .build();
    }

    @Transactional
    public DoctorInvitationDetailsWithPagination getLabStaffInvitations(
            DoctorInvitationActiveOrPendingRequest request) {
        boolean isPlanningOrProduction =
                Boolean.TRUE.equals(userProfileRepository.isInternalUserPlanningOrProduction(request.getProfileId()));

        List<DoctorInvitation> sentInvitations = null;
        List<DoctorInvitation> receivedInvitations = null;
        List<DoctorInvitation> internalUserOwnerInvitations = null;
        List<InvitationRole> invitationRole = request.getInvitationRoles();
        List<InvitationRole> inviterOwnerRoles = request.getInviterOwnerRoles();
        List<InvitationRole> receiverInvitationRoles = request.getReceiversInvitationRoles();

        var user = userProfileRepository.findByIdWithOrgAndDoctorAndUser(request.getProfileId());
        if (StringUtils.hasText(request.getSearch())) {
            sentInvitations = doctorInvitationRepository.findLabStaffAndInternalUserBySearch(
                    request.getDoctorId(),
                    request.getOrganizationId(),
                    List.of(InvitationRole.LAB_STAFF, InvitationRole.INTERNAL_USER),
                    request.getSearch());

            if (user.get().isInternalUser() && user.get().getInviterProfile() != null) {
                var userProfile = user.get();
                var ownerDoctorId = userProfile.getInviterProfile().getDoctor().getId();
                var ownerOrganizationId =
                        userProfile.getInviterProfile().getOrganization().getId();
                internalUserOwnerInvitations = doctorInvitationRepository.findLabStaffAndInternalUserBySearch(
                        ownerDoctorId,
                        ownerOrganizationId,
                        List.of(InvitationRole.LAB_STAFF, InvitationRole.INTERNAL_USER),
                        request.getSearch());
            }
        } else {
            if (invitationRole.contains(InvitationRole.LAB_STAFF)
                    && invitationRole.contains(InvitationRole.INTERNAL_USER)) {
                sentInvitations = doctorInvitationRepository.findAllLabStaffAndInternalUser(
                        request.getDoctorId(),
                        request.getOrganizationId(),
                        List.of(InvitationRole.LAB_STAFF, InvitationRole.INTERNAL_USER));

            } else if (invitationRole.contains(InvitationRole.INTERNAL_USER)) {
                sentInvitations = doctorInvitationRepository.findAllLabStaff(
                        request.getDoctorId(), request.getOrganizationId(), InvitationRole.INTERNAL_USER);
            } else {
                sentInvitations = doctorInvitationRepository.findAllLabStaff(
                        request.getDoctorId(), request.getOrganizationId(), InvitationRole.LAB_STAFF);
            }

            if (user.get().isInternalUser() && user.get().getInviterProfile() != null) {
                var userProfile = user.get();
                var ownerDoctorId = userProfile.getInviterProfile().getDoctor().getId();
                var ownerOrganizationId =
                        userProfile.getInviterProfile().getOrganization().getId();
                internalUserOwnerInvitations = doctorInvitationRepository.findAllLabStaffAndInternalUser(
                        ownerDoctorId,
                        ownerOrganizationId,
                        List.of(InvitationRole.LAB_STAFF, InvitationRole.INTERNAL_USER));
            }
        }

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (!userProfile.getProfileType().equals(ProfileType.INVITED)) {
            if (StringUtils.hasText(request.getSearch())) {
                receivedInvitations = doctorInvitationRepository.findReceivedBySearch(
                        request.getDoctorId(), receiverInvitationRoles, inviterOwnerRoles, request.getSearch());
            } else {
                receivedInvitations = doctorInvitationRepository.findReceivedByDoctorId(
                        request.getDoctorId(), receiverInvitationRoles, inviterOwnerRoles);
            }
        }

        List<DoctorInvitation> invitations = new ArrayList<>();
        invitations.addAll(sentInvitations);
        invitations.addAll(internalUserOwnerInvitations != null ? internalUserOwnerInvitations : new ArrayList<>());
        if (receivedInvitations != null && !receivedInvitations.isEmpty()) {
            invitations.addAll(receivedInvitations);
        }

        invitations = invitations.stream()
                .filter(invitation -> {
                    InvitationStatus requestStatus = request.getInvitationStatus();

                    if (requestStatus == InvitationStatus.ALL) {
                        return true;
                    }
                    if (requestStatus == InvitationStatus.PENDING) {
                        return invitation.getStatus() == InvitationStatus.PENDING;
                    }
                    return requestStatus == invitation.getStatus();
                })
                .collect(Collectors.toList());

        Stream<DoctorInvitation> sortedInvitations = invitations.stream();
        sortedInvitations = applySorting(sortedInvitations, request.getSortOrder());

        List<DoctorInvitationDetails> invitationDetails = sortedInvitations
                .map(invitation -> {
                    Optional<UserProfileSummary> userProfileView;
                    boolean isReceivedInvitation = invitation.getInvitedDoctor() != null
                            && invitation.getInvitedDoctor().getId().equals(request.getDoctorId());
                    DoctorInvitationDetails details = null;

                    if (isReceivedInvitation) {
                        var inviterUserProfile = invitation.getInviterUserProfile();
                        if (inviterUserProfile != null) {
                            userProfileView = userProfileRepository.findSummaryById(inviterUserProfile.getId());
                            if (userProfileView.isPresent()) {
                                details = DoctorInvitationDetails.receivedInvitation(invitation, userProfileView.get());
                                List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(
                                        userProfileView.get().getProfileId());
                                details.setEnabledItems(enabledItems);
                                details.setIsReceivedInvitation(true);
                            }
                        }
                    } else {
                        if (invitation.getInvitedDoctor() != null) {
                            var userProfilesView = userProfileRepository.findUserProfileViewByDoctorId(
                                    invitation.getInvitedDoctor().getId());
                            if (!userProfilesView.isEmpty()) {
                                details = DoctorInvitationDetails.from(invitation, userProfilesView.get(0));
                                details.setIsReceivedInvitation(false);
                                List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(
                                        userProfilesView.get(0).getProfileId());
                                details.setEnabledItems(enabledItems);
                            } else {
                                details = DoctorInvitationDetails.from(invitation, null);
                                details.setIsReceivedInvitation(false);
                            }
                        } else {
                            details = DoctorInvitationDetails.from(invitation, null);
                            details.setIsReceivedInvitation(false);
                        }
                    }
                    return details;
                })
                .filter(Objects::nonNull)
                .filter(details -> details.getInvitationRole().stream().anyMatch(invitationRole::contains))
                .toList();

        List<DoctorInvitationDetails> allInvitationDetails = new ArrayList<>(invitationDetails);

        var adminDetails = DoctorInvitationDetails.from(userProfile, request);
        allInvitationDetails.add(0, adminDetails);

        if (userProfile.getRoles().stream()
                .anyMatch(role -> InvitationRole.LAB_STAFF.name().equals(role.getName()))) {
            if (userProfile.getProfileType().equals(ProfileType.INVITED) && userProfile.getInviterProfile() != null) {
                var inviterProfile = userProfile.getInviterProfile();
                var labAdminDetailsObj = DoctorInvitationDetails.from(inviterProfile, request);

                allInvitationDetails.add(1, labAdminDetailsObj);
            }
        }

        if (isPlanningOrProduction) {
            List<DoctorInvitationDetails> restrictedDetails = new ArrayList<>();
            restrictedDetails.add(adminDetails);

            if (userProfile.getInviterProfile() != null) {
                restrictedDetails.add(DoctorInvitationDetails.from(userProfile.getInviterProfile(), request));
            }

            allInvitationDetails = restrictedDetails;
        }

        DoctorInvitationDetailsWithPagination.PaginationDetails paginationDetails = null;
        List<DoctorInvitationDetails> paginatedInvitationDetails;

        if (request.getPageSize() == 0) {
            paginatedInvitationDetails = allInvitationDetails;
        } else {
            paginatedInvitationDetails =
                    getPaginatedResults(allInvitationDetails, request.getPageNumber(), request.getPageSize());

            var invitationSummary = doctorInvitationRepository
                    .getActivePendingCount(
                            request.getDoctorId(), request.getOrganizationId(), List.of(InvitationRole.LAB_STAFF))
                    .orElse(null);

            var invitationReceivedSummary = doctorInvitationRepository
                    .getReceivedActivePendingCount(request.getDoctorId(), List.of(InvitationRole.LAB_STAFF))
                    .orElse(null);

            long activeInvitationCount = 0L;
            long pendingInvitationCount = 0L;

            if (invitationSummary != null) {
                activeInvitationCount += invitationSummary.getActiveInvitationsCount();
                pendingInvitationCount += invitationSummary.getPendingInvitationsCount();
            }

            if (invitationReceivedSummary != null) {
                activeInvitationCount += invitationReceivedSummary.getActiveInvitationsCount();
                pendingInvitationCount += invitationReceivedSummary.getPendingInvitationsCount();
            }

            paginationDetails = createPaginationDetails(
                    request.getPageNumber(),
                    request.getPageSize(),
                    allInvitationDetails.size(),
                    activeInvitationCount,
                    pendingInvitationCount);
        }

        return DoctorInvitationDetailsWithPagination.builder()
                .doctorInvitationDetailsList(paginatedInvitationDetails)
                .pagination(paginationDetails)
                .build();
    }

    public DoctorInvitationDetails getDoctorInvitationDetailsByInviteCode(String inviteCode, String xOrgName) {

        DoctorInvitationCode doctorInvitationCode = doctorInvitationCodeRepository
                .findByCodeIgnoreCase(inviteCode.trim())
                .orElseThrow(() -> new DoctorInvitationNotFoundException(inviteCode));

        var doctorInvitation = doctorInvitationRepository
                .findById(doctorInvitationCode.getDoctorInvitation().getId())
                .orElseThrow();
        Long subRoleId = null;
        if (doctorInvitation.getAssignedSubRole() != null) {
            subRoleId = doctorInvitation.getAssignedSubRole().getId();
        }
        var subRole = subRoleRepository.findByIdWithPermissions(subRoleId);
        DoctorInvitation invitation = doctorInvitationCode.getDoctorInvitation();

        InvitationValidator.validateNotExpired(invitation);

        FetchLoginType fetchLoginTypeRequest =
                new FetchLoginType(invitation.getEmail(), UserType.DOCTOR, null, xOrgName);
        CredentialType credentialType = authServiceClient.fetchLoginType(fetchLoginTypeRequest);
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(
                        invitation.getInviterUserProfile().getId())
                .orElseThrow(() -> new DoctorNotFoundException(
                        invitation.getInviterUserProfile().getId()));

        return DoctorInvitationDetails.fromInvitation(
                invitation, credentialType, subRole.orElse(null), userProfile.getOrganizationBrandName());
    }

    public DoctorInvitationCountDetails getInvitationCountOfAllRoles(DoctorInvitationCountRequest request) {
        InvitationRoleCountSummary summary;

        String invitationStatus = null;
        var isBillingPresent = doctorBillingRepository.existsBillingByProfileId(request.getProfileId());

        if (request.isFromOrder()) {
            summary = doctorInvitationRepository.findInvitationCountsByRole(
                    request.getOrganizationId(), request.getDoctorId());
            var receivedInvitationCounts = doctorInvitationRepository.receivedInvitationCounts(request.getDoctorId());
            return DoctorInvitationCountDetails.from(
                    summary, isBillingPresent, invitationStatus, receivedInvitationCounts);

        } else {
            summary =
                    doctorInvitationRepository.findInvitationCounts(request.getOrganizationId(), request.getDoctorId());
            invitationStatus = doctorInvitationRepository
                    .findInvitationStatus(request.getOrganizationId(), request.getDoctorId())
                    .map(InvitationRoleCountSummary::getStatus)
                    .orElse(null);
        }

        return DoctorInvitationCountDetails.from(summary, isBillingPresent, invitationStatus);
    }

    public void deactivateInvitation(DoctorInvitationDeactivateRequest request) {
        var invitation = doctorInvitationRepository
                .findById(request.getInvitationId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getInvitationId()));
        invitation.setStatus(InvitationStatus.DEACTIVATED);

        var orgProfile = userProfileRepository
                .findUserProfileByDoctorIdAndOrganizationId(
                        invitation.getInviter().getId(),
                        invitation.getOrganization().getId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getInvitationId()));

        doctorInvitationRepository.save(invitation);
    }

    public void rejectInvitation(DoctorInvitationDeactivateRequest request) {
        var invitation = doctorInvitationRepository
                .findById(request.getInvitationId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getInvitationId()));
        if (invitation.getStatus().equals(InvitationStatus.ACCEPTED)) {
            throw new DoctorInvitationAlreadyAcceptedException(request.getInvitationId());
        }
        invitation.setStatus(InvitationStatus.REJECTED);

        var orgProfile = userProfileRepository
                .findUserProfileByDoctorIdAndOrganizationId(
                        invitation.getInviter().getId(),
                        invitation.getOrganization().getId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getInvitationId()));

        var senderUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        patientService.addEventWithoutPatient(
                null,
                UserType.PATIENT,
                orgProfile.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.DOCTOR_INVITATION_REJECTED,
                new DoctorInvitationRejectedEventMetadata(senderUserProfile.getOrgName(), orgProfile.getOrgName()),
                orgProfile.getId());

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Invitation declined")
                .message(String.format("%s has declined your invitation.", senderUserProfile.getOrgName()))
                .mobile(orgProfile.getUser().getMobileNo())
                .notificationIndex(127)
                .email(orgProfile.getUser().getEmail())
                .isDoctorApp(true)
                .build());
        doctorInvitationRepository.save(invitation);
    }

    @Transactional
    public List<LabDetails> getAcceptedInvitationByStatus(LabDetailsRequest request) {
        List<DoctorInvitation> receivedInvitations;
        List<DoctorInvitation> sentInvitations;
        List<InvitationRole> invitationRoles = request.getInvitationRoles();
        List<InvitationRole> receivedInvitationRoles = request.getInviterRoles();
        List<LabDetails> result = new ArrayList<>();

        if (StringUtils.hasText(request.getSearch())) {
            receivedInvitations = doctorInvitationRepository.findReceivedBySearch(
                    request.getDoctorId(), invitationRoles, receivedInvitationRoles, request.getSearch());
        } else {
            receivedInvitations = doctorInvitationRepository.findReceivedByDoctorId(
                    request.getDoctorId(), invitationRoles, receivedInvitationRoles);
        }

        for (DoctorInvitation invitation : receivedInvitations) {
            String labName = Optional.ofNullable(invitation.getInviterUserProfile())
                    .map(UserProfile::getUser)
                    .map(User::displayName)
                    .orElse("Unknown Lab");

            LabDetails labDetails = LabDetails.builder()
                    .labName(labName)
                    .profileId(Optional.ofNullable(invitation.getInviterUserProfile())
                            .map(UserProfile::getId)
                            .orElse(null))
                    .doctorId(Optional.ofNullable(invitation.getInviter())
                            .map(Doctor::getId)
                            .orElse(null))
                    .organizationId(Optional.ofNullable(invitation.getOrganization())
                            .map(Organization::getId)
                            .orElse(null))
                    .isReceivedInvitation(true)
                    .build();

            result.add(labDetails);
        }

        if (StringUtils.hasText(request.getSearch())) {
            sentInvitations = doctorInvitationRepository.findBySearch(
                    request.getDoctorId(), request.getOrganizationId(), invitationRoles, request.getSearch());
        } else {
            sentInvitations = doctorInvitationRepository.findByDoctorIdAndOrganizationId(
                    request.getDoctorId(), request.getOrganizationId(), invitationRoles);
        }

        for (DoctorInvitation invitation : sentInvitations) {
            if (invitation.getInvitedDoctor() != null) {
                var invitedUserProfile = userProfileRepository.findUserProfileByInviterProfileIdAndDoctorId(
                        invitation.getInviterUserProfile().getId(),
                        invitation.getInvitedDoctor().getId());
                if (invitedUserProfile.isPresent()) {
                    LabDetails labDetails = LabDetails.builder()
                            .labName(invitedUserProfile.get().getDisplayName().trim())
                            .profileId(invitedUserProfile.get().getProfileId())
                            .doctorId(invitedUserProfile.get().getDoctorId())
                            .organizationId(invitedUserProfile.get().getOrganizationId())
                            .isReceivedInvitation(false)
                            .build();
                    result.add(labDetails);
                }
            }
        }

        return result;
    }

    @Transactional(readOnly = true)
    public InvitationRoleCountsWrapper getInvitationCountsByRoles(Long doctorId, Long organizationId, Long profileId) {

        List<InvitationRolesCountSummary> sentSummaries;
        List<InvitationRolesCountSummary> receivedSummaries;
        List<InvitationRolesCountSummary> allSummaries;

        allSummaries = doctorInvitationRepository.findAllInvitationCountsByRoles(doctorId, organizationId);

        sentSummaries = allSummaries.stream()
                .filter(s -> "SENT".equals(s.getDirection()))
                .collect(Collectors.toList());

        receivedSummaries = allSummaries.stream()
                .filter(s -> "RECEIVED".equals(s.getDirection()))
                .collect(Collectors.toList());

        return InvitationRoleCountsWrapper.from(sentSummaries, receivedSummaries, allSummaries);
    }

    // ── Shared helpers ──

    /**
     * Converts the request-level invitation status into a list of DB-level statuses
     * suitable for a SQL {@code IN} clause. This pushes the filter into the DB
     * instead of fetching all rows and discarding in Java.
     * <ul>
     *   <li>{@code ALL}     → every concrete status</li>
     *   <li>{@code PENDING} → PENDING, EXPIRED, REJECTED  (original business rule)</li>
     *   <li>any other       → exactly that status</li>
     * </ul>
     */
    private List<InvitationStatus> resolveStatusFilter(InvitationStatus requestStatus) {
        if (requestStatus == InvitationStatus.ALL) {
            return List.of(
                    InvitationStatus.PENDING,
                    InvitationStatus.ACCEPTED,
                    InvitationStatus.REJECTED,
                    InvitationStatus.EXPIRED,
                    InvitationStatus.DEACTIVATED);
        }
        if (requestStatus == InvitationStatus.PENDING) {
            return List.of(InvitationStatus.PENDING, InvitationStatus.EXPIRED, InvitationStatus.REJECTED);
        }
        return List.of(requestStatus);
    }

    private Stream<DoctorInvitation> applySorting(Stream<DoctorInvitation> stream, SortOrder sortOrder) {
        return switch (sortOrder) {
            case PRACTICE_NAME_ASC -> stream.sorted(Comparator.comparing(DoctorInvitation::getFirstName));
            case PRACTICE_NAME_DESC -> stream.sorted(
                    Comparator.comparing(DoctorInvitation::getFirstName).reversed());
            case ADDED_ON_NEWEST_TO_OLDEST -> stream.sorted(
                    Comparator.comparing(DoctorInvitation::getInvitedAt).reversed());
            case ADDED_ON_OLDEST_TO_NEWEST -> stream.sorted(Comparator.comparing(DoctorInvitation::getInvitedAt));
            case INVITE_DATE_NEWEST_TO_OLDEST -> stream.sorted(Comparator.nullsLast(
                    Comparator.comparing(DoctorInvitation::getLastInvitationAt, Comparator.reverseOrder())));
            case INVITE_DATE_OLDEST_TO_NEWEST -> stream.sorted(Comparator.nullsLast(
                    Comparator.comparing(DoctorInvitation::getLastInvitationAt, ChronoZonedDateTime::compareTo)));
        };
    }

    private List<DoctorInvitationDetails> getPaginatedResults(
            List<DoctorInvitationDetails> allResults, int pageNumber, int pageSize) {
        return allResults.stream()
                .skip((long) pageNumber * pageSize)
                .limit(pageSize)
                .collect(Collectors.toList());
    }

    private DoctorInvitationDetailsWithPagination.PaginationDetails createPaginationDetails(
            int pageNumber, int pageSize, int totalSize, long activeCount, long pendingCount) {
        return DoctorInvitationDetailsWithPagination.PaginationDetails.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalPatients(totalSize)
                .totalPages((int) Math.ceil((double) totalSize / pageSize))
                .hasNext(pageNumber < (totalSize / pageSize) - 1)
                .hasPrevious(pageNumber > 0)
                .activeInvitationCount(activeCount)
                .pendingInvitationCount(pendingCount)
                .build();
    }
}
