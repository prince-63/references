package com.dentalstack.patient.feature.chat.service.impl;

import com.dentalstack.patient.feature.chat.dto.request.CreateCaseTeamRequest;
import com.dentalstack.patient.feature.chat.dto.response.*;
import com.dentalstack.patient.feature.chat.entity.CaseTeam;
import com.dentalstack.patient.feature.chat.repository.CaseTeamRepository;
import com.dentalstack.patient.feature.chat.service.CaseTeamService;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaseTeamServiceImpl implements CaseTeamService {

    private final CaseTeamRepository caseTeamRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public CaseTeamResponse createTeam(CreateCaseTeamRequest request) {
        log.info("Creating case team: {}", request.getTeamName());

        UserProfile creator = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        Set<UserProfile> members = new HashSet<>();
        for (Long memberId : request.getMemberUserProfileIds()) {
            UserProfile member = userProfileRepository
                    .findById(memberId)
                    .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
            members.add(member);
        }

        CaseTeam team = CaseTeam.builder()
                .teamName(request.getTeamName())
                .description(request.getDescription())
                .createdBy(creator)
                .members(members)
                .memberCount(members.size())
                .isActive(true)
                .build();

        team = caseTeamRepository.save(team);

        return buildCaseTeamResponse(team);
    }

    @Override
    @Transactional(readOnly = true)
    public CaseTeamResponse getTeamById(Long teamId) {
        CaseTeam team =
                caseTeamRepository.findById(teamId).orElseThrow(() -> new GenericException("Case team not found"));

        return buildCaseTeamResponse(team);
    }

    @Override
    @Transactional(readOnly = true)
    public CaseTeamListResponse getMyTeams(Long currentUserProfileId, Pageable pageable) {
        Page<CaseTeam> teamsPage = caseTeamRepository.findByCreatedByIdAndIsActiveTrue(currentUserProfileId, pageable);

        List<CaseTeamResponse> teamResponses =
                teamsPage.getContent().stream().map(this::buildCaseTeamResponse).collect(Collectors.toList());

        return CaseTeamListResponse.builder()
                .teams(teamResponses)
                .paginationDetails(buildPaginationDetails(teamsPage))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CaseTeamListResponse getTeamsImIn(Long currentUserProfileId, Pageable pageable) {
        Page<CaseTeam> teamsPage = caseTeamRepository.findTeamsByMemberId(currentUserProfileId, pageable);

        List<CaseTeamResponse> teamResponses =
                teamsPage.getContent().stream().map(this::buildCaseTeamResponse).collect(Collectors.toList());

        return CaseTeamListResponse.builder()
                .teams(teamResponses)
                .paginationDetails(buildPaginationDetails(teamsPage))
                .build();
    }

    @Override
    @Transactional
    public CaseTeamResponse addMembers(Long teamId, List<Long> memberUserProfileIds, Long currentUserProfileId) {
        CaseTeam team =
                caseTeamRepository.findById(teamId).orElseThrow(() -> new GenericException("Case team not found"));

        if (!team.getCreatedBy().getId().equals(currentUserProfileId)) {
            throw new GenericException("Only team creator can add members");
        }

        for (Long memberId : memberUserProfileIds) {
            UserProfile member = userProfileRepository
                    .findById(memberId)
                    .orElseThrow(() -> new GenericException("Member profile not found: " + memberId));
            team.getMembers().add(member);
        }

        team.setMemberCount(team.getMembers().size());
        team = caseTeamRepository.save(team);

        log.info("Added {} members to team {}", memberUserProfileIds.size(), teamId);
        return buildCaseTeamResponse(team);
    }

    @Override
    @Transactional
    public CaseTeamResponse removeMembers(Long teamId, List<Long> memberUserProfileIds, Long currentUserProfileId) {
        CaseTeam team =
                caseTeamRepository.findById(teamId).orElseThrow(() -> new GenericException("Case team not found"));

        if (!team.getCreatedBy().getId().equals(currentUserProfileId)) {
            throw new GenericException("Only team creator can remove members");
        }

        team.getMembers().removeIf(member -> memberUserProfileIds.contains(member.getId()));
        team.setMemberCount(team.getMembers().size());
        team = caseTeamRepository.save(team);

        log.info("Removed {} members from team {}", memberUserProfileIds.size(), teamId);
        return buildCaseTeamResponse(team);
    }

    @Override
    @Transactional
    public void deleteTeam(Long teamId, Long currentUserProfileId) {
        CaseTeam team =
                caseTeamRepository.findById(teamId).orElseThrow(() -> new GenericException("Case team not found"));

        if (!team.getCreatedBy().getId().equals(currentUserProfileId)) {
            throw new GenericException("Only team creator can delete team");
        }

        team.setIsActive(false);
        caseTeamRepository.save(team);

        log.info("Team {} deleted by user {}", teamId, currentUserProfileId);
    }

    @Override
    @Transactional
    public CaseTeamResponse updateTeam(Long teamId, String teamName, String description, Long currentUserProfileId) {
        CaseTeam team =
                caseTeamRepository.findById(teamId).orElseThrow(() -> new GenericException("Case team not found"));

        if (!team.getCreatedBy().getId().equals(currentUserProfileId)) {
            throw new GenericException("Only team creator can update team");
        }

        if (teamName != null) {
            team.setTeamName(teamName);
        }
        if (description != null) {
            team.setDescription(description);
        }

        team = caseTeamRepository.save(team);
        log.info("Team {} updated", teamId);

        return buildCaseTeamResponse(team);
    }

    private CaseTeamResponse buildCaseTeamResponse(CaseTeam team) {
        List<UserProfileInfoResponse> memberResponses =
                team.getMembers().stream().map(this::buildUserProfileInfo).collect(Collectors.toList());

        return CaseTeamResponse.builder()
                .id(team.getId())
                .teamName(team.getTeamName())
                .description(team.getDescription())
                .isActive(team.getIsActive())
                .memberCount(team.getMemberCount())
                .createdAt(team.getCreatedAt())
                .createdBy(buildUserProfileInfo(team.getCreatedBy()))
                .members(memberResponses)
                .build();
    }

    private UserProfileInfoResponse buildUserProfileInfo(UserProfile profile) {
        return UserProfileInfoResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .name(
                        profile.getUser() != null
                                ? profile.getUser().getFirstName() + " "
                                        + profile.getUser().getLastName()
                                : "Unknown")
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .organizationName(profile.getOrganizationBrandName())
                .build();
    }

    private com.dentalstack.patient.global.dto.pagination.PaginationDetails buildPaginationDetails(Page<?> page) {
        return com.dentalstack.patient.global.dto.pagination.PaginationDetails.builder()
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalPatients((int) page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
