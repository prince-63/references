package com.dentalstack.doctor.controller.v1;

import static com.dentalstack.doctor.consts.SwaggerConsts.APP;
import static com.dentalstack.doctor.consts.SwaggerConsts.WEB;

import com.dentalstack.doctor.dto.practicelocation.*;
import com.dentalstack.doctor.dto.responsebuilder.ResponseBuilder;
import com.dentalstack.doctor.dto.responsebuilder.StatusEnum;
import com.dentalstack.doctor.dto.responsebuilder.SuccessCode;
import com.dentalstack.doctor.exception.doctor.ErrorCode;
import com.dentalstack.doctor.service.PracticeLocationService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Tag(name = "practiceLocation", description = "PracticeLocation APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/practice/location/v1/")
@Slf4j
public class PracticeLocationController {

    private final PracticeLocationService practiceLocationService;

    @Tag(name = WEB)
    @PostMapping("/add")
    public ResponseEntity<?> addPracticeLocation(@RequestBody AddPracticeLocationRequest addPracticeLocationRequest) {

        String message = practiceLocationService.addPracticeLocation(addPracticeLocationRequest);

        if (message.equalsIgnoreCase("success")) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(StatusEnum.SUCCESS.getValue(), SuccessCode.OK.getCode(), "message")
                            .build());
        } else {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    "Practice location not created. Something went wrong in request data")
                            .build());
        }
    }

    @Hidden
    @Tag(name = WEB)
    @GetMapping("/get")
    public ResponseEntity<PracticeLocationList> getPracticeLocation(
            @RequestParam(value = "practice_location", required = false) Long practiceLocationId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size) {
        return ResponseEntity.ok(
                PracticeLocationList.from(practiceLocationService.getPracticeLocation(practiceLocationId, page, size)));
    }

    @Hidden
    @Tag(name = WEB)
    @GetMapping("/get/all")
    public ResponseEntity<PracticeLocationAllResponse> getPracticeLocation(
            @RequestParam(value = "practice_location", required = false) Long practiceLocationId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size,
            @RequestParam(value = "all", defaultValue = "false") boolean fetchAll) {

        PracticeLocationAllResponse practiceLocationAllResponse =
                practiceLocationService.getAll(practiceLocationId, page, size, fetchAll);

        return ResponseEntity.ok(practiceLocationAllResponse);
    }

    @Tag(name = WEB)
    @GetMapping("/get/all/by/doctor")
    public ResponseEntity<PracticeLocationAllResponse> getAllPracticeLocationsForDoctor(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size,
            @RequestParam(value = "all", defaultValue = "false") boolean fetchAll) {

        PracticeLocationAllResponse practiceLocationAllResponse =
                practiceLocationService.getPracticeLocationsForDoctor(doctorId, page, size, fetchAll);

        return ResponseEntity.ok(practiceLocationAllResponse);
    }

    @Tag(name = WEB)
    @PostMapping("")
    public ResponseEntity<PracticeLocationAllResponse> getAllPracticeLocationsForDoctor(
            @Valid @RequestBody PracticeLocationGetRequest request) {
        PracticeLocationAllResponse practiceLocationAllResponse =
                practiceLocationService.getPracticeLocationsForDoctor(request);
        return ResponseEntity.ok(practiceLocationAllResponse);
    }

    @Tag(name = WEB)
    @PostMapping("/practice/location/assignto/patient")
    public ResponseEntity<?> assignPracticeLocationToPatient(
            @Valid @RequestBody AssignPracticeLocationToPatientRequest assignPracticeLocationToPatientRequest) {

        String assignPracticeLocationToPatient =
                practiceLocationService.assignPracticeLocationToPatient(assignPracticeLocationToPatientRequest);

        if (assignPracticeLocationToPatient != null) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    assignPracticeLocationToPatient)
                            .build());
        } else {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Doctor patient status has not been updated. Something went wrong in request data")
                            .build());
        }
    }

    @Tag(name = APP)
    @PostMapping("/practice/location/assign/to/patient")
    public String assignPracticeLocationToPatientForApp(
            @Valid @RequestBody AssignPracticeLocationToPatientRequest assignPracticeLocationToPatientRequest) {
        return practiceLocationService.assignPracticeLocationToPatient(assignPracticeLocationToPatientRequest);
    }

    @Tag(name = APP)
    @PostMapping("/remove/{patient_id}")
    public void removePatientPractice(@PathVariable("patient_id") Long patientId) {
        practiceLocationService.removePracticeLocationFromPatient(patientId);
    }

    @Tag(name = WEB)
    @PostMapping("/practice/location/update")
    public ResponseEntity<?> updatePracticeLocation(
            @Valid @RequestBody UpdatePracticeLocationRequest updatePracticeLocationRequest) {

        String message;

        message = practiceLocationService.updatePracticeLocation(updatePracticeLocationRequest);
        if (Objects.equals(message, "True")) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    "Practice location updated successfully")
                            .build());
        } else {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Practice location status has not been updated. Something went wrong in request data")
                            .build());
        }
    }

    @Tag(name = APP)
    @GetMapping("/get/count")
    public Long getCountOfLocation(@RequestParam(value = "doctorId", required = false) Long doctorId) {
        return practiceLocationService.getActiveCount(doctorId);
    }

    @Tag(name = APP)
    @GetMapping("/get/by/patientId/list")
    public List<PLOfPatientResponse> getPracticeLocationOfPatient(
            @RequestParam(value = "patientId", required = false) List<Long> patientId) {
        return practiceLocationService.getPracticeLocationByList(patientId);
    }

    @Tag(name = APP)
    @GetMapping("/get/by/patientId/list/filter")
    public List<PLOfPatientResponse> getPracticeLocationOfPatientForFilter(
            @RequestParam(value = "patientId", required = false) List<Long> patientId) {
        return practiceLocationService.getPracticeLocationByListForFilter(patientId);
    }

    @Tag(name = APP)
    @GetMapping("/get/by/patientId")
    public PLOfPatientResponse getIndividualClinic(
            @RequestParam(value = "patientId", required = false) Long patientId) {
        return practiceLocationService.getPracticeLocationByPatientId(patientId);
    }

    @Tag(name = WEB)
    @GetMapping("/get/active/by/doctor")
    public ResponseEntity<PracticeLocationAllResponse> getActivePracticeLocation(
            @RequestParam(value = "doctor_id", required = false) Long doctorId) {

        PracticeLocationAllResponse practiceLocationAllResponse =
                practiceLocationService.getActiveLocationOfDoctor(doctorId, null, null);

        return ResponseEntity.ok(practiceLocationAllResponse);
    }

    @Tag(name = WEB)
    @PostMapping("/active")
    public ResponseEntity<PracticeLocationAllResponse> getActivePracticeLocation(
            @RequestBody @Valid ActivePracticeLocationRequest request) {
        PracticeLocationAllResponse practiceLocationAllResponse = practiceLocationService.getActiveLocationOfDoctor(
                request.getDoctorId(), request.getOrganizationId(), request.getProfileId());

        return ResponseEntity.ok(practiceLocationAllResponse);
    }

    // TODO shift below code to service
    @GetMapping("/getGoogleMapsData")
    public ResponseEntity<String> getGoogleMapsData(
            @RequestParam(value = "placeId", required = false) String placeId,
            @RequestParam(value = "apiKey", required = false) String apiKey) {

        String apiUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=" + apiKey;

        RestTemplate restTemplate = new RestTemplate();
        int maxRetries = 3;
        int retryCount = 0;
        String response = null;
        while (retryCount < maxRetries) {
            try {
                response = restTemplate.getForObject(apiUrl, String.class);
                if (response != null && !response.isEmpty()) {
                    break; // Exit loop if response is not empty
                } else {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        // Retry limit reached, handle the failure
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to fetch data from Google Maps API");
                    }
                    // Sleep for a moment before retrying
                    try {
                        Thread.sleep(50);
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                    }
                }
            } catch (RestClientException e) {
                // Log the exception or handle it as needed
                retryCount++;
                if (retryCount >= maxRetries) {
                    // Retry limit reached, handle the failure
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to fetch data from Google Maps API");
                }
                // Sleep for a moment before retrying
                try {
                    Thread.sleep(50);
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        return ResponseEntity.ok(response);
    }
}
