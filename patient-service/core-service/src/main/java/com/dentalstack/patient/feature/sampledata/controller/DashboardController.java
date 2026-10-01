package com.dentalstack.patient.feature.sampledata.controller;

import com.dentalstack.patient.application.security.model.UserPrincipal;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/patient/v5/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    @GetMapping("/enterprise")
    @PreAuthorize("@authz.hasRole('ENTERPRISE')")
    public ResponseEntity<Map<String, Object>> getEnterpriseDashboard(@AuthenticationPrincipal UserPrincipal user) {

        log.info("Enterprise dashboard accessed by user: {}", user.getProfileId());

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", user.getProfileId());
        response.put("type", "enterprise");
        response.put("message", "Enterprise dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/manufacturing")
    @PreAuthorize("@authz.hasRole('ENTERPRISE') and @authz.hasConfiguration('MANUFACTURING')")
    public ResponseEntity<Map<String, Object>> getManufacturingDashboard(@AuthenticationPrincipal UserPrincipal user) {

        log.info("Manufacturing dashboard accessed by user: {}", user.getProfileId());

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", user.getProfileId());
        response.put("type", "manufacturing");
        response.put("configurations", user.getEnabledConfigurations());
        response.put("message", "Manufacturing dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/planning")
    @PreAuthorize("@authz.hasRole('ENTERPRISE') and @authz.hasConfiguration('PLANNING')")
    public ResponseEntity<Map<String, Object>> getPlanningDashboard(@AuthenticationPrincipal UserPrincipal user) {

        log.info("Planning dashboard accessed by user: {}", user.getProfileId());

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", user.getProfileId());
        response.put("type", "planning");
        response.put("configurations", user.getEnabledConfigurations());
        response.put("message", "Planning dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/general")
    @PreAuthorize("@authz.hasAnyRole('ENTERPRISE', 'PRACTICE', 'IN_HOUSE_MANUFACTURING_LAB')")
    public ResponseEntity<Map<String, Object>> getGeneralDashboard(@AuthenticationPrincipal UserPrincipal user) {

        log.info("General dashboard accessed by user: {} with roles: {}", user.getProfileId(), user.getRoles());

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", user.getProfileId());
        response.put("roles", user.getRoles());
        response.put("message", "General dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/practice")
    @PreAuthorize("@authz.hasRole('PRACTICE')")
    public ResponseEntity<Map<String, Object>> getPracticeDashboard(@AuthenticationPrincipal UserPrincipal user) {

        log.info("Practice dashboard accessed by user: {}", user.getProfileId());

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", user.getProfileId());
        response.put("type", "practice");
        response.put("message", "Practice dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/in-house-lab")
    @PreAuthorize("@authz.hasRole('IN_HOUSE_MANUFACTURING_LAB')")
    public ResponseEntity<Map<String, Object>> getInHouseLabDashboard(@AuthenticationPrincipal UserPrincipal user) {

        log.info("In-house lab dashboard accessed by user: {}", user.getProfileId());

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", user.getProfileId());
        response.put("type", "in-house-lab");
        response.put("message", "In-house manufacturing lab dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("@authz.isInternalOrAdmin()")
    public ResponseEntity<Map<String, Object>> getAdminDashboard(@AuthenticationPrincipal UserPrincipal user) {

        log.info("Admin dashboard accessed by user: {}", user.getProfileId());

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", user.getProfileId());
        response.put("type", "admin");
        response.put("message", "Admin dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{profileId}")
    @PreAuthorize("@authz.isOwnProfile(#profileId)")
    public ResponseEntity<Map<String, Object>> getProfileDashboard(
            @PathVariable Long profileId, @AuthenticationPrincipal UserPrincipal user) {

        log.info("Profile dashboard accessed by user: {} for profile: {}", user.getProfileId(), profileId);

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", profileId);
        response.put("requestedBy", user.getProfileId());
        response.put("message", "Profile-specific dashboard data");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/{reportType}")
    @PreAuthorize(
            "(@authz.hasRole('ENTERPRISE') and @authz.hasConfiguration('PLANNING')) or @authz.isInternalOrAdmin()")
    public ResponseEntity<Map<String, Object>> getReport(
            @PathVariable String reportType, @AuthenticationPrincipal UserPrincipal user) {

        log.info("Report '{}' accessed by user: {}", reportType, user.getProfileId());

        Map<String, Object> response = new HashMap<>();
        response.put("reportType", reportType);
        response.put("profileId", user.getProfileId());
        response.put("message", "Report data");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/manufacturing/orders")
    @PreAuthorize("@authz.hasManufacturingAccess()")
    public ResponseEntity<Map<String, Object>> createManufacturingOrder(
            @RequestBody Map<String, Object> orderRequest, @AuthenticationPrincipal UserPrincipal user) {

        log.info("Manufacturing order creation requested by user: {}", user.getProfileId());

        Long requestDoctorId = Long.valueOf(orderRequest.get("doctor_id").toString());
        if (!user.getProfileId().equals(requestDoctorId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied", "message", "Profile mismatch"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", "ORD-12345");
        response.put("status", "created");
        response.put("createdBy", user.getProfileId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/update-profile")
    @PreAuthorize("@authz.canAccessPatientData()")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, Object> updateRequest, @AuthenticationPrincipal UserPrincipal user) {

        Long profileId = Long.valueOf(updateRequest.get("profile_id").toString());

        if (!user.getProfileId().equals(profileId) && !user.isInternalUser()) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Access denied", "message", "Cannot update other user's profile"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", profileId);
        response.put("status", "updated");
        response.put("updatedBy", user.getProfileId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/stats")
    public ResponseEntity<Map<String, Object>> getPublicStats(@AuthenticationPrincipal UserPrincipal user) {

        log.info("Public stats accessed by user: {}", user != null ? user.getProfileId() : "anonymous");

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", 1000);
        response.put("totalOrders", 5000);
        response.put("message", "Public statistics");

        return ResponseEntity.ok(response);
    }
}
