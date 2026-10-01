package com.dentalstack.doctor.controller.v1;

import com.dentalstack.doctor.dto.OrganizationRequest;
import com.dentalstack.doctor.dto.OrganizationResponse;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.enums.organization.OrganizationType;
import com.dentalstack.doctor.repository.user.OrganizationRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "organization", description = "Organization APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/v1/organization")
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    @PostMapping
    public ResponseEntity<OrganizationResponse> createOrganization(OrganizationRequest organizationRequest) {
        String dummyName = organizationRequest.getEmail().split("@")[0];
        Organization organization = Organization.builder()
                .name(dummyName + "'s Clinic")
                .type(OrganizationType.SELF_OWNED)
                .active(true)
                .build();
        organizationRepository.save(organization);
        return ResponseEntity.ok(OrganizationResponse.from(organization));
    }

    @DeleteMapping
    public void deleteOrganization(@RequestHeader("organization_id") Long organizationId) {
        organizationRepository.deleteById(organizationId);
    }
}
