package com.dentalstack.patient.feature.consent_template.controller;

import com.dentalstack.patient.feature.consent_template.dto.*;
import com.dentalstack.patient.feature.consent_template.service.ConsentTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Consent Template API", description = "Simplified APIs for managing consent templates")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/consent-template/v1")
@Slf4j
public class ConsentTemplateController {

    private final ConsentTemplateService consentTemplateService;

    @PostMapping
    @Operation(
            summary = "Create or Update consent template",
            description =
                    "Creates a new consent template if template_id is not provided, otherwise updates the existing template.")
    public ResponseEntity<ConsentTemplateDetails> saveConsentTemplate(
            @Valid @RequestBody AddConsentTemplateRequest request) {
        if (request.getTemplateId() != null) {
            return ResponseEntity.ok(consentTemplateService.updateConsent(request.getTemplateId(), request));
        } else {
            ConsentTemplateDetails created = consentTemplateService.addConsent(request);
            return ResponseEntity.ok(created);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a consent template",
            description = "Soft deletes a consent template by setting is_active to false")
    public ResponseEntity<Void> deleteConsentTemplate(@Parameter(description = "Template ID") @PathVariable Long id) {
        log.info("Request to delete consent template with ID: {}", id);
        consentTemplateService.deleteConsent(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/list")
    @Operation(
            summary = "Get consent templates with dynamic filters",
            description =
                    "Retrieves consent templates filtered by profile_id (required), consent_template_type, and/or consent_template_location.")
    public ResponseEntity<ConsentTemplateListResponse> getConsentTemplates(
            @RequestBody ConsentTemplateRequest request) {
        return ResponseEntity.ok(consentTemplateService.getAllConsents(request));
    }

    @PostMapping("/default")
    @Operation(summary = "Get default consent template")
    public ResponseEntity<ConsentTemplateDetails> getDefaultConsentTemplate(
            @RequestBody GetDefaultConsentRequest request) {
        return ResponseEntity.ok(consentTemplateService.getDefaultConsent(request));
    }
}
