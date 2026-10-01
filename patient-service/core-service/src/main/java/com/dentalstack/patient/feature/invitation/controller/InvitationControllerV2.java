package com.dentalstack.patient.feature.invitation.controller;

import com.dentalstack.patient.feature.invitation.dto.InvitationDetails;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.invitation.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Invitation v2", description = "APIs for the inviting users v2")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/invitation/v2/")
public class InvitationControllerV2 {

    private final InvitationService invitationService;

    @PostMapping("/")
    @Operation(summary = "Invite a new patient")
    @Transactional
    public ResponseEntity<InvitationDetails> inviteUser(@Valid @RequestBody InvitePatientRequestV2 request) {
        return ResponseEntity.ok(InvitationDetails.from(invitationService.invitePatientV2(request)));
    }
}
