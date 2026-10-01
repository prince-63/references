package com.dentalstack.chat.controller.v1.email.vsp;

import com.dentalstack.chat.dto.email.vsp.*;
import com.dentalstack.chat.service.VspPlanningEmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mail/vsp/v1")
@RequiredArgsConstructor
public class VspPlanningEmailController {

    private final VspPlanningEmailService vspPlanningEmailService;

    @PostMapping("/customer-invitation")
    public ResponseEntity<String> sendVspCustomerInvitationEmail(
            @Valid @RequestBody VspCustomerInvitationEmailRequest request) {
        vspPlanningEmailService.sendVspCustomerInvitationEmail(request);
        return ResponseEntity.ok("VSP customer invitation email sent successfully");
    }

    @PostMapping("/case-assigned")
    public ResponseEntity<String> sendVspCaseAssignedEmail(@Valid @RequestBody VspCaseAssignedEmailRequest request) {
        vspPlanningEmailService.sendVspCaseAssignedEmail(request);
        return ResponseEntity.ok("VSP case assigned email sent successfully");
    }

    @PostMapping("/case-submitted")
    public ResponseEntity<String> sendVspCaseSubmittedEmail(@Valid @RequestBody VspCaseSubmittedEmailRequest request) {
        vspPlanningEmailService.sendVspCaseSubmittedEmail(request);
        return ResponseEntity.ok("VSP case submitted email sent successfully");
    }

    @PostMapping("/more-info-required")
    public ResponseEntity<String> sendVspMoreInfoRequiredEmail(
            @Valid @RequestBody VspMoreInfoRequiredEmailRequest request) {
        vspPlanningEmailService.sendVspMoreInfoRequiredEmail(request);
        return ResponseEntity.ok("VSP more info required email sent successfully");
    }

    @PostMapping("/planning-completed")
    public ResponseEntity<String> sendVspPlanningCompletedEmail(
            @Valid @RequestBody VspPlanningCompletedEmailRequest request) {
        vspPlanningEmailService.sendVspPlanningCompletedEmail(request);
        return ResponseEntity.ok("VSP planning completed email sent successfully");
    }

    @PostMapping("/files-uploaded")
    public ResponseEntity<String> sendVspFilesUploadedEmail(@Valid @RequestBody VspFilesUploadedEmailRequest request) {
        vspPlanningEmailService.sendVspFilesUploadedEmail(request);
        return ResponseEntity.ok("VSP files uploaded email sent successfully");
    }

    @PostMapping("/plan-ready")
    public ResponseEntity<String> sendVspPlanReadyEmail(@Valid @RequestBody VspPlanReadyEmailRequest request) {
        vspPlanningEmailService.sendVspPlanReadyEmail(request);
        return ResponseEntity.ok("VSP plan ready email sent successfully");
    }

    @PostMapping("/plan-approved")
    public ResponseEntity<String> sendVspPlanApprovedEmail(@Valid @RequestBody VspPlanApprovedEmailRequest request) {
        vspPlanningEmailService.sendVspPlanApprovedEmail(request);
        return ResponseEntity.ok("VSP plan approved email sent successfully");
    }

    @PostMapping("/revision-requested")
    public ResponseEntity<String> sendVspRevisionRequestedEmail(
            @Valid @RequestBody VspRevisionRequestedEmailRequest request) {
        vspPlanningEmailService.sendVspRevisionRequestedEmail(request);
        return ResponseEntity.ok("VSP revision requested email sent successfully");
    }

    @PostMapping("/order-shipped")
    public ResponseEntity<String> sendVspOrderShippedEmail(@Valid @RequestBody VspOrderShippedEmailRequest request) {
        vspPlanningEmailService.sendVspOrderShippedEmail(request);
        return ResponseEntity.ok("VSP order shipped email sent successfully");
    }

    @PostMapping("/production-order-created")
    public ResponseEntity<String> sendVspProductionOrderCreatedEmail(
            @Valid @RequestBody VspProductionOrderCreatedEmailRequest request) {
        vspPlanningEmailService.sendVspProductionOrderCreatedEmail(request);
        return ResponseEntity.ok("VSP production order created email sent successfully");
    }

    @PostMapping("/order-delivered")
    public ResponseEntity<String> sendVspOrderDeliveredEmail(
            @Valid @RequestBody VspOrderDeliveredEmailRequest request) {
        vspPlanningEmailService.sendVspOrderDeliveredEmail(request);
        return ResponseEntity.ok("VSP order delivered email sent successfully");
    }

    @PostMapping("/new-message")
    public ResponseEntity<String> sendVspNewMessageEmail(@Valid @RequestBody VspNewMessageEmailRequest request) {
        vspPlanningEmailService.sendVspNewMessageEmail(request);
        return ResponseEntity.ok("VSP new message email sent successfully");
    }

    @PostMapping("/customer-signedup")
    public ResponseEntity<String> sendVspCustomerSignedUpEmail(
            @Valid @RequestBody VspCustomerSignedUpEmailRequest request) {
        vspPlanningEmailService.sendVspCustomerSignedUpEmail(request);
        return ResponseEntity.ok("VSP customer signed up email sent successfully");
    }
}
