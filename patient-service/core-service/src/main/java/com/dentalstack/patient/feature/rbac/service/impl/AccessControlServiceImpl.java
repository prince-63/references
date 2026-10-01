package com.dentalstack.patient.feature.rbac.service.impl;

import static com.dentalstack.patient.feature.doctor.enums.DoctorRole.INTERNAL_USER;

import com.amazonaws.services.kms.model.NotFoundException;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctorinvitation.repository.DoctorInvitationRepository;
import com.dentalstack.patient.feature.rbac.dto.auditlog.CreateAuditRequest;
import com.dentalstack.patient.feature.rbac.dto.request.*;
import com.dentalstack.patient.feature.rbac.dto.response.*;
import com.dentalstack.patient.feature.rbac.entity.*;
import com.dentalstack.patient.feature.rbac.entity.Module;
import com.dentalstack.patient.feature.rbac.enums.AuditAction;
import com.dentalstack.patient.feature.rbac.enums.PermissionType;
import com.dentalstack.patient.feature.rbac.enums.SubRoleTag;
import com.dentalstack.patient.feature.rbac.exception.AccessControlException;
import com.dentalstack.patient.feature.rbac.projection.InvitationSummaryProjection;
import com.dentalstack.patient.feature.rbac.repository.*;
import com.dentalstack.patient.feature.rbac.service.AccessControlService;
import com.dentalstack.patient.feature.rbac.service.AuditLogService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccessControlServiceImpl implements AccessControlService {

    private final PlanRepository planRepository;
    private final SubRoleRepository subRoleRepository;
    private final ModuleRepository moduleRepository;
    private final SubModuleRepository subModuleRepository;
    private final UserProfileRepository userProfileRepository;
    private final DoctorInvitationRepository doctorInvitationRepository;
    private final AuditLogService auditLogService;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    private final SubRoleModulePermissionRepository subRoleModulePermissionRepository;
    private final SubRoleSubModulePermissionRepository subRoleSubModulePermissionRepository;
    private final String CUSTOMER_WITH_TRACKING = "Customer (With Tracking)";

    private final String CUSTOMER_WITH_OUT_TRACKING = "Customer (Without Tracking)";
    private final String CUSTOMER = "Customer";
    private final String PRODUCTION = "Production";
    private final String PLANNING = "Planning";

    @Override
    @Transactional
    public Plan createPlan(PlanRequest request) {
        Plan plan = Plan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return planRepository.save(plan);
    }

    @Override
    public Plan getPlanById(Long id) {
        return planRepository.findById(id).orElseThrow(() -> new NotFoundException("Plan not found with id: " + id));
    }

    @Override
    @Transactional
    public SubRole createSubRole(CreateCustomOrDefaultRoles request) {
        Plan plan = planRepository
                .findById(request.getPlanId())
                .orElseThrow(() -> new AccessControlException("Plan not found with id: " + request.getPlanId()));

        if (subRoleRepository.existsByNameAndPlan(request.getName(), plan)) {
            throw new AccessControlException("SubRole with name '" + request.getName()
                    + "' already exists for plan with id: " + request.getPlanId());
        }

        SubRole subRole = SubRole.builder()
                .name(request.getName())
                .description(request.getDescription())
                .subRoleTag(request.getSubRoleTag())
                .plan(plan)
                .isActive(true)
                .build();

        return subRoleRepository.save(subRole);
    }

    @Transactional
    @Override
    public SubRoleResponse createCustomRole(CreateCustomOrDefaultRoles request) {
        Plan plan = planRepository
                .findPlanWithDefaultAndUserCustomRoles(request.getPlanId(), request.getProfileId())
                .orElseThrow(() -> new AccessControlException("Plan not found with id: " + request.getPlanId()));

        var userProfile =
                userProfileRepository.findById(request.getProfileId()).orElseThrow(DoctorNotFoundException::new);

        SubRole subRole = SubRole.builder()
                .name(request.getName())
                .description(request.getDescription())
                .subRoleTag(SubRoleTag.CUSTOM)
                .plan(plan)
                .isActive(true)
                .createdBy(userProfile)
                .build();

        if (request.getCloneFromSubRoleId() != null) {
            SubRole originalSubRole = subRoleRepository
                    .findById(request.getCloneFromSubRoleId())
                    .orElseThrow(() -> new AccessControlException(
                            "SubRole to clone not found with id: " + request.getCloneFromSubRoleId()));

            subRole.setClonedFrom(originalSubRole);
            subRole.setIsCloned(true);
        }

        SubRole savedSubRole = subRoleRepository.save(subRole);

        if (request.getCloneFromSubRoleId() != null) {

            clonePermissionsFromSubRole(request.getCloneFromSubRoleId(), savedSubRole);
        } else {

            createPermissionsFromPlanStructure(plan, savedSubRole, request.getSubModules());
        }
        createRoleCreationAuditLog(savedSubRole, userProfile, request.getCloneFromSubRoleId() != null);
        return SubRoleResponse.from(savedSubRole);
    }

    private void createRoleCreationAuditLog(SubRole subRole, UserProfile createdBy, boolean isCloned) {
        String actionDescription = isCloned ? "Cloned role from existing template" : "Created new custom role";

        CreateAuditRequest auditRequest = CreateAuditRequest.builder()
                .subRoleId(subRole.getId())
                .assignedByProfileId(createdBy.getId())
                .action(AuditAction.ROLE_CREATED)
                .changeDescription(actionDescription)
                .previousValue(null)
                .newValue(subRole.getName())
                .roleName(subRole.getName())
                .build();

        auditLogService.createAuditLog(auditRequest);
    }

    private void clonePermissionsFromSubRole(Long originalSubRoleId, SubRole newSubRole) {
        SubRole originalSubRole = subRoleRepository
                .findById(originalSubRoleId)
                .orElseThrow(
                        () -> new AccessControlException("Original SubRole not found with id: " + originalSubRoleId));

        List<SubRoleModulePermission> clonedModulePermissions = originalSubRole.getModulePermissions().stream()
                .map(original -> SubRoleModulePermission.builder()
                        .subRole(newSubRole)
                        .module(original.getModule())
                        .build())
                .toList();

        List<SubRoleSubModulePermission> clonedSubModulePermissions = originalSubRole.getSubModulePermissions().stream()
                .map(original -> SubRoleSubModulePermission.builder()
                        .subRole(newSubRole)
                        .subModule(original.getSubModule())
                        .permissions(new HashSet<>(original.getPermissions()))
                        .build())
                .toList();

        subRoleModulePermissionRepository.saveAll(clonedModulePermissions);
        subRoleSubModulePermissionRepository.saveAll(clonedSubModulePermissions);
    }

    private void createPermissionsFromPlanStructure(
            Plan plan, SubRole newSubRole, List<CreateSubModuleRequest> customSubModules) {

        SubRole defaultSubRole = plan.getSubRoles().stream()
                .filter(sr -> "SUPER_ADMIN".equalsIgnoreCase(sr.getName()))
                .findFirst()
                .orElseThrow(() -> new AccessControlException("Super Admin SubRole not found in Plan"));

        Map<Long, Set<PermissionType>> customPermissionsMap = customSubModules != null
                ? customSubModules.stream()
                        .filter(module -> module.getSubModuleId() != null)
                        .collect(Collectors.toMap(
                                CreateSubModuleRequest::getSubModuleId,
                                CreateSubModuleRequest::getPermissions,
                                (existing, duplicate) -> {
                                    Set<PermissionType> merged = new HashSet<>(existing);
                                    merged.addAll(duplicate);
                                    return merged;
                                }))
                : Collections.emptyMap();

        List<SubRoleModulePermission> newModulePermissions = defaultSubRole.getModulePermissions().stream()
                .map(defaultModulePermission -> SubRoleModulePermission.builder()
                        .subRole(newSubRole)
                        .module(defaultModulePermission.getModule())
                        .build())
                .toList();

        List<SubRoleSubModulePermission> newSubModulePermissions = defaultSubRole.getSubModulePermissions().stream()
                .map(defaultSubModulePermission -> {
                    SubModule subModule = defaultSubModulePermission.getSubModule();
                    Set<PermissionType> permissions =
                            customPermissionsMap.getOrDefault(subModule.getId(), Collections.emptySet());

                    return SubRoleSubModulePermission.builder()
                            .subRole(newSubRole)
                            .subModule(subModule)
                            .permissions(new HashSet<>(permissions))
                            .build();
                })
                .toList();

        subRoleModulePermissionRepository.saveAll(newModulePermissions);
        subRoleSubModulePermissionRepository.saveAll(newSubModulePermissions);
    }

    @Transactional
    @Override
    public SubRoleResponse editCustomRole(EditCustomRoleRequest request) {
        SubRole subRoleToEdit = subRoleRepository
                .findById(request.getSubRoleId())
                .orElseThrow(() -> new NotFoundException("SubRole not found with id: " + request.getSubRoleId()));

        if (subRoleToEdit.getCreatedBy() == null || !SubRoleTag.CUSTOM.equals(subRoleToEdit.getSubRoleTag())) {
            throw new AccessControlException("Only custom roles can be edited");
        }

        if (!subRoleToEdit.getCreatedBy().getId().equals(request.getProfileId())) {
            throw new AccessControlException("User can only edit their own custom roles");
        }

        String oldName = subRoleToEdit.getName();
        String oldDescription = subRoleToEdit.getDescription();

        subRoleToEdit.setName(request.getName());
        subRoleToEdit.setDescription(request.getDescription());

        if (request.getCloneFromSubRoleId() != null) {
            updateRoleByCloning(request.getCloneFromSubRoleId(), subRoleToEdit);
        } else {
            updateSubModulePermissions(subRoleToEdit, request.getSubModules());
        }

        SubRole savedSubRole = subRoleRepository.save(subRoleToEdit);

        createRoleUpdateAuditLog(
                savedSubRole, request.getProfileId(), oldName, oldDescription, request.getCloneFromSubRoleId() != null);

        return SubRoleResponse.from(savedSubRole);
    }

    private void createRoleUpdateAuditLog(
            SubRole subRole, Long updatedByProfileId, String oldName, String oldDescription, boolean isClonedUpdate) {

        String changeDescription =
                isClonedUpdate ? "Updated role by cloning from another role" : "Updated role permissions and details";

        StringBuilder previousValue = new StringBuilder();
        StringBuilder newValue = new StringBuilder();

        if (!oldName.equals(subRole.getName())) {
            previousValue.append("Name: ").append(oldName).append("; ");
            newValue.append("Name: ").append(subRole.getName()).append("; ");
        }

        if (!oldDescription.equals(subRole.getDescription())) {
            previousValue.append("Description: ").append(oldDescription).append("; ");
            newValue.append("Description: ").append(subRole.getDescription()).append("; ");
        }

        if (previousValue.isEmpty()) {
            previousValue.append("Permission structure modified");
            newValue.append("Permission structure modified");
        }

        CreateAuditRequest auditRequest = CreateAuditRequest.builder()
                .subRoleId(subRole.getId())
                .assignedByProfileId(updatedByProfileId)
                .action(AuditAction.ROLE_UPDATED)
                .changeDescription(changeDescription)
                .previousValue(previousValue.toString())
                .newValue(newValue.toString())
                .roleName(subRole.getName())
                .moduleName("Role Management")
                .build();

        auditLogService.createAuditLog(auditRequest);
    }

    private void updateRoleByCloning(Long cloneFromSubRoleId, SubRole targetSubRole) {
        SubRole sourceSubRole = subRoleRepository
                .findById(cloneFromSubRoleId)
                .orElseThrow(() -> new NotFoundException("Source SubRole not found with id: " + cloneFromSubRoleId));

        targetSubRole.setClonedFrom(sourceSubRole);
        targetSubRole.setIsCloned(true);

        clearExistingPermissions(targetSubRole);

        clonePermissionsFromSubRole(cloneFromSubRoleId, targetSubRole);
    }

    private void updateSubModulePermissions(SubRole subRole, List<CreateSubModuleRequest> subModuleRequests) {
        if (subModuleRequests == null || subModuleRequests.isEmpty()) {
            return;
        }

        Map<Long, Set<PermissionType>> permissionUpdates = subModuleRequests.stream()
                .collect(Collectors.toMap(
                        CreateSubModuleRequest::getSubModuleId, CreateSubModuleRequest::getPermissions));

        for (SubRoleSubModulePermission permission : subRole.getSubModulePermissions()) {
            Long subModuleId = permission.getSubModule().getId();
            if (permissionUpdates.containsKey(subModuleId)) {
                permission.setPermissions(new HashSet<>(permissionUpdates.get(subModuleId)));
                subRoleSubModulePermissionRepository.save(permission);
            }
        }
    }

    private void clearExistingPermissions(SubRole subRole) {
        subRoleModulePermissionRepository.deleteAll(subRole.getModulePermissions());

        subRoleSubModulePermissionRepository.deleteAll(subRole.getSubModulePermissions());

        subRole.getModulePermissions().clear();
        subRole.getSubModulePermissions().clear();
    }

    @Override
    public SubRoleResponse getSubRoleById(Long id) {
        var subRole = subRoleRepository
                .findByIdWithPermissions(id)
                .orElseThrow(() -> new AccessControlException("SubRole not found with id: " + id));
        return getSubRoleResponse(subRole);
    }

    @Override
    @Transactional
    public Module createModule(ModuleRequest request) {
        Module module = Module.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return moduleRepository.save(module);
    }

    @Override
    public Module getModuleById(Long id) {
        return moduleRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Module not found with id: " + id));
    }

    @Override
    @Transactional
    public SubModule createSubModule(SubModuleRequest request) {
        Module module = moduleRepository
                .findById(request.getModuleId())
                .orElseThrow(() -> new NotFoundException("Module not found with id: " + request.getModuleId()));

        SubModule subModule = SubModule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .module(module)
                .build();

        return subModuleRepository.save(subModule);
    }

    @Override
    public SubModule getSubModuleById(Long id) {
        return subModuleRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("SubModule not found with id: " + id));
    }

    @Override
    public AccessControlResponse getAccessControlResponse(AccessControlRequest request) {
        Plan plan = planRepository
                .findPlanWithDefaultAndUserCustomRoles(request.getPlanId(), request.getProfileId())
                .orElseThrow(() -> new NotFoundException("Plan not found with id: " + request.getPlanId()));
        return getPlanAccessStructure(plan);
    }

    public AccessControlSubRoleResponse getAccessControlSubRoleResponse(AccessControlRequest request) {
        Plan plan = planRepository
                .findPlanWithDefaultAndUserCustomRolesWithMinimal(request.getPlanId(), request.getProfileId())
                .orElseThrow(() -> new AccessControlException("Plan not found with id: " + request.getPlanId()));

        List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(request.getProfileId());

        return getAccessControlSubRoleResponse(plan, enabledItems);
    }

    private AccessControlSubRoleResponse getAccessControlSubRoleResponse(Plan plan, List<String> enabledItems) {
        Set<SubRole> filteredSubRoles = plan.getSubRoles();

        if (enabledItems.contains("MANUFACTURING") || enabledItems.contains("PLANNING")) {
            filteredSubRoles = filteredSubRoles.stream()
                    .filter(subRole -> {
                        String roleName = subRole.getName();
                        return !roleName.equalsIgnoreCase(CUSTOMER_WITH_TRACKING)
                                && !roleName.equalsIgnoreCase(CUSTOMER)
                                && !roleName.equalsIgnoreCase(CUSTOMER_WITH_OUT_TRACKING)
                                && !roleName.equalsIgnoreCase(PRODUCTION);
                    })
                    .collect(Collectors.toSet());
        }

        if (enabledItems.contains("MANUFACTURING")) {
            filteredSubRoles = filteredSubRoles.stream()
                    .filter(subRole -> {
                        String roleName = subRole.getName();
                        return !roleName.equalsIgnoreCase(CUSTOMER_WITH_TRACKING)
                                && !roleName.equalsIgnoreCase(CUSTOMER)
                                && !roleName.equalsIgnoreCase(CUSTOMER_WITH_OUT_TRACKING)
                                && !roleName.equalsIgnoreCase(PLANNING);
                    })
                    .collect(Collectors.toSet());
        }

        return AccessControlSubRoleResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .planId(plan.getId())
                .subRoles(filteredSubRoles.stream()
                        .map(this::getSubRoleResponseMinimal)
                        .collect(Collectors.toList()))
                .build();
    }

    private MinimalSubRoleResponse getSubRoleResponseMinimal(SubRole subRole) {
        return MinimalSubRoleResponse.builder()
                .id(subRole.getId())
                .name(subRole.getName())
                .subRoleTag(subRole.getSubRoleTag())
                .description(subRole.getDescription())
                .build();
    }

    private AccessControlResponse getPlanAccessStructure(Plan plan) {
        return AccessControlResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .subRoles(plan.getSubRoles().stream()
                        .map(this::getSubRoleResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private SubRoleResponse getSubRoleResponse(SubRole subRole) {
        List<ModuleResponse> modules = buildModuleResponsesForSubRole(subRole);

        return SubRoleResponse.builder()
                .id(subRole.getId())
                .name(subRole.getName())
                .description(subRole.getDescription())
                .subRoleTag(subRole.getSubRoleTag())
                .planId(subRole.getPlan() != null ? subRole.getPlan().getId() : null)
                .modules(modules)
                .clonedFromSubRole(
                        subRole.getClonedFrom() != null
                                ? ClonedFromSubRoleResponse.from(subRole.getClonedFrom())
                                : null)
                .build();
    }

    private List<ModuleResponse> buildModuleResponsesForSubRole(SubRole subRole) {
        Map<Module, List<SubRoleSubModulePermission>> moduleToSubModulePermissions =
                subRole.getSubModulePermissions().stream()
                        .collect(Collectors.groupingBy(
                                permission -> permission.getSubModule().getModule()));

        return moduleToSubModulePermissions.entrySet().stream()
                .map(entry -> {
                    Module module = entry.getKey();
                    List<SubRoleSubModulePermission> subModulePermissions = entry.getValue();

                    List<SubModuleResponse> subModuleResponses = subModulePermissions.stream()
                            .map(permission -> SubModuleResponse.builder()
                                    .id(permission.getSubModule().getId())
                                    .name(permission.getSubModule().getName())
                                    .description(permission.getSubModule().getDescription())
                                    .permissions(new ArrayList<>(permission.getPermissions()))
                                    .build())
                            .collect(Collectors.toList());

                    return ModuleResponse.builder()
                            .id(module.getId())
                            .name(module.getName())
                            .description(module.getDescription())
                            .subModules(subModuleResponses)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignSubRoleToUser(AssignSubRoleRequest request) {
        UserProfile userProfile = userProfileRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new AccessControlException("UserProfile not found with id: " + request.getUserId()));

        SubRole subRole = subRoleRepository
                .findById(request.getSubRoleId())
                .orElseThrow(() -> new AccessControlException("SubRole not found with id: " + request.getSubRoleId()));

        userProfile.setSubRole(subRole);
        userProfileRepository.save(userProfile);
    }

    @Override
    public AccessControlUserResponseList getUsers(AccessControlUsersRequest request) {
        Long inviterUserProfileId = request.getProfileId();
        Long subRoleId = request.getSubRoleId();
        String searchTerm = request.getSearch();
        InvitationStatus invitationStatus = request.getStatus();
        int pageNumber = request.getPageNumber();
        int pageSize = request.getPageSize();

        var userProfile = userProfileRepository
                .findUserProfileWithPlanHierarchy(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        List<InvitationSummaryProjection> invitationSummaries;
        Long actualDbCount;

        boolean willAddSuperAdmin = request.getStatus().equals(InvitationStatus.ALL) && request.getSubRoleId() == null;
        AccessControlUserResponse superAdminUser = null;

        if (willAddSuperAdmin) {
            superAdminUser = createSuperAdminUser(userProfile);
            if (!matchesSearchCriteria(superAdminUser, searchTerm)) {
                willAddSuperAdmin = false;
                superAdminUser = null;
            }
        }

        if (pageSize == 0) {
            invitationSummaries = doctorInvitationRepository.getInvitationSummariesWithoutPagination(
                    inviterUserProfileId, subRoleId, searchTerm, invitationStatus.name());
            actualDbCount = (long) invitationSummaries.size();
        } else {
            int dbOffset;
            int dbLimit;

            if (willAddSuperAdmin) {
                if (pageNumber == 0) {
                    dbOffset = 0;
                    dbLimit = pageSize - 1;
                } else {
                    dbOffset = (pageSize - 1) + (pageNumber - 1) * pageSize;
                    dbLimit = pageSize;
                }
            } else {
                dbOffset = pageNumber * pageSize;
                dbLimit = pageSize;
            }

            invitationSummaries = doctorInvitationRepository.getInvitationSummariesWithOffset(
                    inviterUserProfileId, subRoleId, searchTerm, invitationStatus.name(), dbOffset, dbLimit);

            actualDbCount =
                    doctorInvitationRepository.countInvitationSummaries(inviterUserProfileId, subRoleId, searchTerm);
        }

        List<AccessControlUserResponse> users = invitationSummaries.stream()
                .map(projection -> {
                    AccessControlUserResponse response =
                            AccessControlUserResponse.mapToAccessControlUserResponse(projection);

                    Long invitedDoctorId = projection.getInvitedDoctorId();
                    Long inviterProfileIdFromProjection = projection.getInviterUserProfileId();

                    if (invitedDoctorId != null && inviterProfileIdFromProjection != null) {
                        var userProfileSummary = userProfileRepository
                                .findUserProfileByDoctorIdAndInviterProfileId(
                                        invitedDoctorId, inviterProfileIdFromProjection)
                                .orElseGet(() -> {
                                    var userProfileSummaries =
                                            userProfileRepository.findUserProfilesByDoctorId(invitedDoctorId);
                                    return userProfileSummaries.isEmpty() ? null : userProfileSummaries.get(0);
                                });

                        if (userProfileSummary != null) {
                            response.setProfileId(userProfileSummary.getId());
                        } else {
                            response.setProfileId(null);
                        }
                    } else {
                        response.setProfileId(null);
                    }

                    return response;
                })
                .collect(Collectors.toList());

        if (willAddSuperAdmin && (pageSize == 0 || pageNumber == 0)) {
            users.add(0, superAdminUser);
        }

        Long totalCount = actualDbCount;
        if (willAddSuperAdmin) {
            totalCount++;
        }

        PaginationDetails paginationDetails = null;

        if (pageSize != 0) {

            int totalPages = (int) Math.ceil((double) totalCount / pageSize);
            boolean hasNext = pageNumber < (totalPages - 1);
            boolean hasPrevious = pageNumber > 0;

            paginationDetails = PaginationDetails.builder()
                    .pageNumber(pageNumber)
                    .pageSize(pageSize)
                    .totalPatients(totalCount.intValue())
                    .totalPages(totalPages)
                    .hasNext(hasNext)
                    .hasPrevious(hasPrevious)
                    .build();
        }

        return AccessControlUserResponseList.builder()
                .users(users)
                .paginationDetails(paginationDetails)
                .build();
    }

    private AccessControlUserResponseList getWithoutPaginationUsers(UserProfile userProfile) {
        var activeInternalUsers = userProfileRepository.findActiveInviterUsers(
                userProfile.getOrganization().getId(), ProfileType.INVITED, userProfile.getId(), INTERNAL_USER.name());

        List<AccessControlUserResponse> userResponses = activeInternalUsers.stream()
                .map(user -> AccessControlUserResponse.builder()
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .mobileNumber(user.getMobileNo())
                        .profileImageUrl(user.getProfilePicture())
                        .salutation(user.getSalutation())
                        .profileId(user.getProfileId())
                        .build())
                .collect(Collectors.toList());

        return AccessControlUserResponseList.builder()
                .users(userResponses)
                .paginationDetails(null)
                .build();
    }

    private AccessControlUserResponse createSuperAdminUser(UserProfile userProfile) {
        return AccessControlUserResponse.builder()
                .firstName(userProfile.getUser().getFirstName())
                .lastName(userProfile.getUser().getLastName())
                .email(userProfile.getUser().getEmail())
                .mobileNumber(userProfile.getUser().getMobileNo())
                .profileImageUrl(userProfile.getUser().getProfileUrl())
                .profileImageId(
                        userProfile.getUser().getProfileImage() != null
                                ? userProfile.getUser().getProfileImage().getId()
                                : null)
                .salutation(userProfile.getUser().getSalutation())
                .subRoleName("SUPER_ADMIN")
                .invitationStatus(InvitationStatus.ACCEPTED)
                .build();
    }

    private boolean matchesSearchCriteria(AccessControlUserResponse user, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return true;
        }

        String search = searchTerm.toLowerCase().trim();

        return (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(search))
                || (user.getLastName() != null
                        && user.getLastName().toLowerCase().contains(search))
                || (user.getEmail() != null && user.getEmail().toLowerCase().contains(search))
                || (user.getMobileNumber() != null && user.getMobileNumber().contains(search))
                || (user.getSubRoleName() != null
                        && user.getSubRoleName().toLowerCase().contains(search));
    }

    @Transactional
    @Override
    public SubRoleResponse assignSubModulePermissions(AssignSubModulePermissionRequest request) {
        Long subRoleId = request.getSubRoleId();
        Long subModuleId = request.getSubModuleId();
        Set<PermissionType> permissions = request.getPermissions();
        SubRole subRole =
                subRoleRepository.findById(subRoleId).orElseThrow(() -> new NotFoundException("SubRole not found"));

        SubModule subModule = subModuleRepository
                .findById(subModuleId)
                .orElseThrow(() -> new AccessControlException("SubModule not found"));

        Optional<SubRoleSubModulePermission> existingPermission =
                subRoleSubModulePermissionRepository.findBySubRoleAndSubModule(subRole, subModule);

        if (existingPermission.isPresent()) {

            existingPermission.get().setPermissions(permissions);
            subRoleSubModulePermissionRepository.save(existingPermission.get());
        } else {

            SubRoleSubModulePermission newPermission = SubRoleSubModulePermission.builder()
                    .subRole(subRole)
                    .subModule(subModule)
                    .permissions(permissions)
                    .build();

            subRoleSubModulePermissionRepository.save(newPermission);
        }
        return SubRoleResponse.from(subRole);
    }

    public Set<PermissionType> getSubModulePermissions(Long subRoleId, Long subModuleId) {
        SubRole subRole =
                subRoleRepository.findById(subRoleId).orElseThrow(() -> new NotFoundException("SubRole not found"));

        SubModule subModule = subModuleRepository
                .findById(subModuleId)
                .orElseThrow(() -> new AccessControlException("SubModule not found"));

        Optional<SubRoleSubModulePermission> permission =
                subRoleSubModulePermissionRepository.findBySubRoleAndSubModule(subRole, subModule);

        return permission.map(SubRoleSubModulePermission::getPermissions).orElse(new HashSet<>());
    }

    @Transactional
    @Override
    public SubRoleResponse copyModuleSubModulePermissions(CopyModulePermissionsRequest request) {
        Long sourceSubRoleId = request.getSourceSubRoleId();
        Long targetSubRoleId = request.getTargetSubRoleId();
        Long moduleId = request.getModuleId();

        SubRole sourceSubRole = subRoleRepository
                .findByIdWithPermissions(sourceSubRoleId)
                .orElseThrow(() -> new NotFoundException("Source SubRole not found with id: " + sourceSubRoleId));

        SubRole targetSubRole = subRoleRepository
                .findByIdWithPermissions(targetSubRoleId)
                .orElseThrow(() -> new NotFoundException("Target SubRole not found with id: " + targetSubRoleId));

        Module module = moduleRepository
                .findById(moduleId)
                .orElseThrow(() -> new NotFoundException("Module not found with id: " + moduleId));

        List<SubRoleSubModulePermission> sourceSubModulePermissions = sourceSubRole.getSubModulePermissions().stream()
                .filter(permission ->
                        permission.getSubModule().getModule().getId().equals(moduleId))
                .toList();

        if (sourceSubModulePermissions.isEmpty()) {
            throw new AccessControlException(
                    "Source sub-role has no submodule permissions for module with id: " + moduleId);
        }

        for (SubRoleSubModulePermission sourcePermission : sourceSubModulePermissions) {
            SubModule subModule = sourcePermission.getSubModule();
            Set<PermissionType> permissionsToCopy = new HashSet<>(sourcePermission.getPermissions());

            Optional<SubRoleSubModulePermission> existingPermission =
                    subRoleSubModulePermissionRepository.findBySubRoleAndSubModule(targetSubRole, subModule);

            if (existingPermission.isPresent()) {
                existingPermission.get().setPermissions(permissionsToCopy);
                subRoleSubModulePermissionRepository.save(existingPermission.get());
            } else {
                SubRoleSubModulePermission newPermission = SubRoleSubModulePermission.builder()
                        .subRole(targetSubRole)
                        .subModule(subModule)
                        .permissions(permissionsToCopy)
                        .build();
                subRoleSubModulePermissionRepository.save(newPermission);
            }
        }

        boolean hasModuleAccess = targetSubRole.getModulePermissions().stream()
                .anyMatch(permission -> permission.getModule().getId().equals(moduleId));

        if (!hasModuleAccess) {
            SubRoleModulePermission modulePermission = SubRoleModulePermission.builder()
                    .subRole(targetSubRole)
                    .module(module)
                    .build();
            subRoleModulePermissionRepository.save(modulePermission);
        }

        targetSubRole = subRoleRepository
                .findByIdWithPermissions(targetSubRoleId)
                .orElseThrow(() -> new NotFoundException("Target SubRole not found after copying permissions"));

        return getSubRoleResponse(targetSubRole);
    }
}
