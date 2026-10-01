package com.dentalstack.chat.controller.v1.email.planning;

import com.dentalstack.chat.dto.email.planningcustomer.*;
import com.dentalstack.chat.service.PlanningEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mail/planning/v1")
@RequiredArgsConstructor
public class PlanningEmailController {

    private final PlanningEmailService planningEmailService;

    @PostMapping("/add-patient")
    public ResponseEntity<String> sendAddPatientEmail(@RequestBody AddPatientEmailRequest request) {
        planningEmailService.sendAddPatientEmail(request);
        return ResponseEntity.ok("Add patient email sent successfully");
    }

    @PostMapping("/need-more-info")
    public ResponseEntity<String> sendNeedMoreInfoEmail(@RequestBody NeedMoreInfoEmailRequest request) {
        planningEmailService.sendNeedMoreInfoEmail(request);
        return ResponseEntity.ok("Need More Info email sent successfully");
    }

    @PostMapping("/plan-ready")
    public ResponseEntity<String> sendPlanReadyEmail(@RequestBody PlanReadyEmailRequest request) {
        planningEmailService.sendPlanReadyEmail(request);
        return ResponseEntity.ok("Plan Ready email sent successfully");
    }

    @PostMapping("/plan-approved")
    public ResponseEntity<String> sendPlanApprovedEmail(@RequestBody PlanApprovedEmailRequest request) {
        planningEmailService.sendPlanApprovedEmail(request);
        return ResponseEntity.ok("Plan Approved email sent successfully");
    }

    @PostMapping("/in-review")
    public ResponseEntity<String> sendInRevisionEmail(@RequestBody InRevisionEmailRequest request) {
        planningEmailService.sendInRevisionEmail(request);
        return ResponseEntity.ok("In Review email sent successfully");
    }

    @PostMapping("/stl-file-uploaded")
    public ResponseEntity<String> sendStlFileUploadedEmail(@RequestBody StlFileUploadedEmailRequest request) {
        planningEmailService.sendStlFileUploadedEmail(request);
        return ResponseEntity.ok("STL File Uploaded email sent successfully");
    }

    @PostMapping("/case-completed")
    public ResponseEntity<String> sendCaseCompletedEmail(@RequestBody CaseCompletedEmailRequest request) {
        planningEmailService.sendCaseCompletedEmail(request);
        return ResponseEntity.ok("Case Completed email sent successfully");
    }
}
