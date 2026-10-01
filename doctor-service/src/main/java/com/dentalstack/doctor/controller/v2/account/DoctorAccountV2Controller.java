package com.dentalstack.doctor.controller.v2.account;

import com.dentalstack.doctor.dto.account.DoctorAccountDetails;
import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.exception.billing.FailedToParseCreateBillingException;
import com.dentalstack.doctor.service.DoctorV2Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Doctor account", description = "Doctor account APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/account/v2/")
public class DoctorAccountV2Controller {

    private final DoctorV2Service doctorV2Service;

    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @PostMapping(
            value = "/update",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "update doctor account details")
    public ResponseEntity<DoctorAccountDetails> updateDoctorAccountDetails(
            @Parameter(
                            name = "details",
                            example =
                                    """
{
"first_name": "John",
"last_name": "Doe",
"email": "john.doe@example.com",
"mobile_no": "+1234567890",
"doctor_id": 1,
"organization_id": 67890,
"profile_id": 1,
"display_name": "Dr. John Doe"
}
                      """)
                    @Valid
                    @RequestParam("details")
                    String reqStr,
            @Valid @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @Valid @RequestPart(value = "displayProfileImage", required = false) MultipartFile displayProfileImage) {
        new UpdateDoctorAccountRequest();
        UpdateDoctorAccountRequest request;
        try {
            request = mapper.readValue(reqStr, UpdateDoctorAccountRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseCreateBillingException(reqStr, e);
        }
        return ResponseEntity.ok(DoctorAccountDetails.from(
                doctorV2Service.updateDoctorAccountDetails(request, profileImage, displayProfileImage)));
    }
}
