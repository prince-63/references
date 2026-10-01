package com.dentalstack.patient.feature.subcription.controller;

import com.dentalstack.patient.feature.subcription.dto.SubscriptionAccountUpgradeRequestDTO;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.dto.UpgradeSubscription;
import com.dentalstack.patient.feature.subcription.service.SubscriptionNotificationService;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subscription", description = "Subscription APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/subscription/v1")
@Slf4j
public class SubscriptionPlanController {

    private final SubscriptionService subscriptionService;
    private final SubscriptionNotificationService subscriptionNotificationService;

    @GetMapping("/details/{doctor_id}/{user_profile_id}")
    @Operation(summary = "Doctor subscription details")
    public ResponseEntity<SubscriptionPlanDTO> getSubSubscriptionDetails(
            @PathVariable("doctor_id") Long doctorId, @PathVariable("user_profile_id") Long userProfileId) {
        return ResponseEntity.ok(subscriptionService.getSubSubscriptionDetails(doctorId, userProfileId));
    }

    @PostMapping("/flag")
    public ResponseEntity<SubscriptionPlanDTO> updateSubscriptionFlag(@RequestBody SubscriptionPlanDTO request)
            throws Exception {
        SubscriptionPlanDTO subscriptionPlanDTO = subscriptionService.extendCurrentSubscription(request);
        return ResponseEntity.ok(subscriptionPlanDTO);
    }

    @GetMapping("/details/{doctor_id}")
    @Operation(summary = "Doctor subscription details for all profiles")
    public List<SubscriptionPlanDTO> getSubSubscriptionDetails(@PathVariable("doctor_id") Long doctorId) {
        return subscriptionService.getAllSubSubscriptionDetails(doctorId);
    }

    @GetMapping("/update-flag/{user_profile_id}")
    @Operation(summary = "make upgrade flag false for subscription")
    public String makeFalseUpgradeFlag(@PathVariable("user_profile_id") Long userProfileId) {
        return subscriptionService.makeFalseUpgradeFlag(userProfileId);
    }

    @PostMapping("/account-upgrade")
    @Operation(summary = "Doctor subscription details for all profiles")
    public void getSubSubscriptionDetails(@RequestBody SubscriptionAccountUpgradeRequestDTO request) {
        subscriptionService.requestForPlanUpgrade(request);
    }

    @GetMapping("/deactivate-subscription/{doctorId}")
    @Operation(summary = "Deactivate doctor subscription")
    public String deactivateAccount(
            @PathVariable("doctorId") Long doctorId, @RequestParam(required = false) String authCode) {
        if (authCode == null) {
            return "Access Denied.";
        }
        if (!"Sdds.Atpl@0312".equals(authCode)) {
            return "Access Denied";
        }
        subscriptionService.deactivateAccount(doctorId, authCode);
        return "Subscription deactivated successfully";
    }

    @GetMapping("/email")
    public void getSubSubscriptionDetails() {
        subscriptionNotificationService.processSubscriptionNotifications();
    }

    @PostMapping("/subscription/toggle-is-demo-completed")
    public void toggleIsDemoCompleted(@RequestParam Long profileId, @RequestParam Long doctorId) {
        subscriptionService.toggleIsDemoCompleted(profileId, doctorId);
    }

    @PostMapping("/upgrade")
    @Operation(summary = "Doctor subscription details for all profiles")
    public void updateSubscription(@RequestBody UpgradeSubscription request) {
        subscriptionService.upgradeSubscription(request);
    }
}
