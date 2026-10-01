package com.dentalstack.doctor.controller.v1.profile;

import com.dentalstack.doctor.dto.DoctorProfileRequest;
import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.profile.DoctorProfileDetails;
import com.dentalstack.doctor.dto.profile.DoctorsProfileResponse;
import com.dentalstack.doctor.dto.profile.MarkProfileAsDefaultRequest;
import com.dentalstack.doctor.service.profile.DoctorProfileManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Profile management", description = "Doctor profile management apis")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/profile/management/v1/")
@Slf4j
public class DoctorProfileManagementController {

    private final DoctorProfileManagementService doctorProfileManagementService;

    @GetMapping("/details/{doctor_id}/{organization_id}")
    @Operation(summary = "Get doctor details")
    public ResponseEntity<List<DoctorProfileDetails>> getDoctorProfile(
            @PathVariable("doctor_id") Long doctorId, @PathVariable("organization_id") Long organizationId) {
        return ResponseEntity.ok(doctorProfileManagementService.getDoctorProfile(doctorId, organizationId));
    }

    @PostMapping("/profiles")
    @Operation(summary = "Get profile details")
    public ResponseEntity<List<DoctorsProfileResponse>> getDoctorProfile(
            @RequestBody DoctorProfileRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(doctorProfileManagementService.getProfiles(request, xOrgName));
    }

    @GetMapping("/profiles")
    @Operation(summary = "Get profile details")
    public ResponseEntity<List<DoctorsProfileResponse>> getDoctorProfile(
            @RequestParam(value = "email") String email, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(doctorProfileManagementService.getProfiles(email, xOrgName));
    }

    @PostMapping("/mark-as-default")
    @Operation(summary = "Mark as default")
    public DoctorDetails markProfileAsDefault(@Valid @RequestBody MarkProfileAsDefaultRequest request) {
        return doctorProfileManagementService.markProfileAsDefault(request);
    }
}
