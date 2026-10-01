package com.dentalstack.patient.feature.doctorinvitation.controller;

import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationRequest;
import com.dentalstack.patient.feature.doctorinvitation.service.DoctorInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Doctor Invitation api", description = "Invitation APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/doctor/invitation/v1/")
@Slf4j
public class DoctorInvitationController {

    private final DoctorInvitationService doctorInvitationService;

    @PostMapping("/")
    @Operation(summary = "Add or update practice")
    @Transactional
    public ResponseEntity<DoctorInvitationDetails> inviteDoctor(
            @Valid @RequestBody DoctorInvitationRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(DoctorInvitationDetails.from(doctorInvitationService.inviteDoctor(request, xOrgName)));
    }
}
