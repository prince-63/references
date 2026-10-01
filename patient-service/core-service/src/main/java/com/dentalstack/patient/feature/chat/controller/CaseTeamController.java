package com.dentalstack.patient.feature.chat.controller;

import com.dentalstack.patient.feature.chat.dto.request.CreateCaseTeamRequest;
import com.dentalstack.patient.feature.chat.dto.response.CaseTeamListResponse;
import com.dentalstack.patient.feature.chat.dto.response.CaseTeamResponse;
import com.dentalstack.patient.feature.chat.service.CaseTeamService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/case-teams")
@RequiredArgsConstructor
@Slf4j
public class CaseTeamController {

    private final CaseTeamService caseTeamService;

    @PostMapping
    public ResponseEntity<CaseTeamResponse> createTeam(@Valid @RequestBody CreateCaseTeamRequest request) {

        log.info("Creating case team: {}", request.getTeamName());
        CaseTeamResponse response = caseTeamService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<CaseTeamResponse> getTeamById(@PathVariable Long teamId) {

        CaseTeamResponse response = caseTeamService.getTeamById(teamId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<CaseTeamListResponse> getMyTeams(
            @RequestParam("profile_id") Long currentUserProfileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        CaseTeamListResponse response = caseTeamService.getMyTeams(currentUserProfileId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/membership")
    public ResponseEntity<CaseTeamListResponse> getTeamsImIn(
            @RequestParam("profile_id") Long currentUserProfileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        CaseTeamListResponse response = caseTeamService.getTeamsImIn(currentUserProfileId, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<CaseTeamResponse> addMembers(
            @PathVariable Long teamId,
            @RequestBody List<Long> memberUserProfileIds,
            @RequestParam("profile_id") Long currentUserProfileId) {

        log.info("Adding {} members to team {}", memberUserProfileIds.size(), teamId);
        CaseTeamResponse response = caseTeamService.addMembers(teamId, memberUserProfileIds, currentUserProfileId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{teamId}/members")
    public ResponseEntity<CaseTeamResponse> removeMembers(
            @PathVariable Long teamId,
            @RequestBody List<Long> memberUserProfileIds,
            @RequestParam("profile_id") Long currentUserProfileId) {

        log.info("Removing {} members from team {}", memberUserProfileIds.size(), teamId);
        CaseTeamResponse response = caseTeamService.removeMembers(teamId, memberUserProfileIds, currentUserProfileId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<CaseTeamResponse> updateTeam(
            @PathVariable Long teamId,
            @RequestParam(required = false) String teamName,
            @RequestParam(required = false) String description,
            @RequestParam("profile_id") Long currentUserProfileId) {

        log.info("Updating team {}", teamId);
        CaseTeamResponse response = caseTeamService.updateTeam(teamId, teamName, description, currentUserProfileId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable Long teamId, @RequestParam("profile_id") Long currentUserProfileId) {

        log.info("Deleting team {}", teamId);
        caseTeamService.deleteTeam(teamId, currentUserProfileId);
        return ResponseEntity.noContent().build();
    }
}
