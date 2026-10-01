package com.dentalstack.doctor.controller.v1.billing;

import com.dentalstack.doctor.dto.billing.DoctorBillingDetails;
import com.dentalstack.doctor.dto.billing.DoctorBillingRequest;
import com.dentalstack.doctor.exception.billing.FailedToParseCreateBillingException;
import com.dentalstack.doctor.service.billing.DoctorBillingService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Doctor billing", description = "Doctor billing apis")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/billing/v1/")
@Slf4j
public class DoctorBillingController {

    private final DoctorBillingService doctorBillingService;
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @PostMapping(
            value = "/",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Add or update doctor billing details")
    public ResponseEntity<DoctorBillingDetails> createAppointment(
            @Parameter(
                            name = "details",
                            example =
                                    """
   {
         "doctor_id": 1,
         "organization_id": 1,
         "profile_id": 1,
         "billing_id": null,
         "company_legal_name": "ABC Dental Clinic",
         "address_line1": "123 Elm Street",
         "address_line2": "Suite 456",
         "country": "USA",
         "state": "California",
         "city": "Los Angeles",
         "pincode": "90001",
         "company_tax_id": "TAX123456",
         "currency": "USD",
         "company_image_url": null,
         "file_action": "UPDATE",
         "file_brand_action": "UPDATE",
         "company_brand_name": "Flash",
     }

                                      """)
                    @Valid
                    @RequestParam("details")
                    String reqStr,
            @Valid @RequestPart(value = "image", required = false) MultipartFile file,
            @Valid @RequestPart(value = "company_image_profile", required = false)
                    MultipartFile companyBrandProfilePicture) {
        new DoctorBillingRequest();
        DoctorBillingRequest request;
        try {
            request = mapper.readValue(reqStr, DoctorBillingRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseCreateBillingException(reqStr, e);
        }
        return ResponseEntity.ok(DoctorBillingDetails.from(
                doctorBillingService.addOrUpdateDoctorBillingDetails(request, file, companyBrandProfilePicture)));
    }

    @GetMapping("/{profile_id}/{organization_id}/{doctor_id}")
    @Operation(summary = "Get doctor billing details")
    public ResponseEntity<DoctorBillingDetails> getDoctorBillingDetails(
            @PathVariable("doctor_id") long doctorId,
            @PathVariable("organization_id") long organizationId,
            @PathVariable("profile_id") long profileId) {
        return ResponseEntity.ok(doctorBillingService.getDoctorBillingDetails(organizationId, doctorId, profileId));
    }
}
