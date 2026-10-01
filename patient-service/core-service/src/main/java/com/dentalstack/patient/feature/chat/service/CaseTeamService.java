package com.dentalstack.patient.feature.chat.service;

import com.dentalstack.patient.feature.chat.dto.request.CreateCaseTeamRequest;
import com.dentalstack.patient.feature.chat.dto.response.CaseTeamListResponse;
import com.dentalstack.patient.feature.chat.dto.response.CaseTeamResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface CaseTeamService {

    CaseTeamResponse createTeam(CreateCaseTeamRequest request);

    CaseTeamResponse getTeamById(Long teamId);

    CaseTeamListResponse getMyTeams(Long currentUserProfileId, Pageable pageable);

    CaseTeamListResponse getTeamsImIn(Long currentUserProfileId, Pageable pageable);

    CaseTeamResponse addMembers(Long teamId, List<Long> memberUserProfileIds, Long currentUserProfileId);

    CaseTeamResponse removeMembers(Long teamId, List<Long> memberUserProfileIds, Long currentUserProfileId);

    void deleteTeam(Long teamId, Long currentUserProfileId);

    CaseTeamResponse updateTeam(Long teamId, String teamName, String description, Long currentUserProfileId);
}
