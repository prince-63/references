package com.dentalstack.doctor.controller.v1;

import com.dentalstack.doctor.client.PatientServiceClient;
import com.dentalstack.doctor.dto.CreateCardDisplayConfigRequestDto;
import com.dentalstack.doctor.dto.S3.Feature;
import com.dentalstack.doctor.dto.chat.DoctorForChatService;
import com.dentalstack.doctor.dto.doctor.*;
import com.dentalstack.doctor.dto.rbac.AddProfileRequest;
import com.dentalstack.doctor.dto.responsebuilder.ResponseBuilder;
import com.dentalstack.doctor.dto.responsebuilder.StatusEnum;
import com.dentalstack.doctor.dto.responsebuilder.SuccessCode;
import com.dentalstack.doctor.dto.user.CreateUserProfile;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.exception.doctor.ErrorCode;
import com.dentalstack.doctor.exception.doctor.InvalidRequestException;
import com.dentalstack.doctor.service.DoctorService;
import com.dentalstack.doctor.service.FileService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "doctor", description = "Doctor APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/v1/")
@Slf4j
public class DoctorController {

    private final DoctorService doctorService;
    private final PatientServiceClient patientServiceClient;

    private final FileService fileService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> doctorUpdate(
            @RequestPart UpdateDoctor req,
            @RequestPart(name = "profileImage", required = false) MultipartFile profileImage) {
        try {
            Doctor doctor = doctorService.updateDoctor(req, profileImage);
            if (doctor != null) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body(ResponseBuilder.builder()
                                .status(
                                        StatusEnum.SUCCESS.getValue(),
                                        SuccessCode.OK.getCode(),
                                        "Doctor data updated successfully")
                                .result(DoctorDetails.from(doctor))
                                .build());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseBuilder.builder()
                                .status(
                                        StatusEnum.FAILURE.getValue(),
                                        ErrorCode.BAD_REQUEST.getCode(),
                                        "The doctor's data was not updated. There appears to be an issue with the request data.")
                                .build());
            }
        } catch (Exception e) {
            // Handle any exceptions that may occur during the update process
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.ERROR.getValue(),
                                    ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                                    "An error occurred while processing the request.")
                            .build());
        }
    }

    @Operation(summary = "Update the doctor", description = "You have to add the all fields every time ")
    @PostMapping(
            path = "/doctor/update",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateDoctor(
            @RequestParam String updateDoctorRequest, @RequestParam(required = false) MultipartFile profileImage) {
        UpdateDoctor updateDoctor;
        ObjectMapper mapper = new ObjectMapper();
        try {
            updateDoctor = mapper.readValue(updateDoctorRequest, UpdateDoctor.class);
        } catch (JsonProcessingException e) {
            throw new InvalidRequestException(
                    ErrorCode.REQUEST_BODY_MISMATCH,
                    "Invalid request String. An issue occurred while processing the request data.");
        }

        // Validate profile image format
        if (profileImage != null && !(profileImage.getOriginalFilename().length() == 0)) {
            String originalFilename = profileImage.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
            List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png");

            if (!allowedExtensions.contains(fileExtension.toLowerCase())) {
                throw new InvalidRequestException(
                        ErrorCode.INVALID_IMAGE_FORMAT,
                        "Invalid profile picture format. Only JPG, JPEG, and PNG formats are allowed.");
            }

            String fileName =
                    fileService.uploadFile(profileImage, Feature.DOCTOR_PROFILE, updateDoctor.getDoctorId() + "");
            updateDoctor.setProfileImage(fileName);
        }

        Doctor doctor = doctorService.updateDoctor(updateDoctor, profileImage);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ResponseBuilder.builder()
                        .status(
                                StatusEnum.SUCCESS.getValue(),
                                SuccessCode.OK.getCode(),
                                "Doctor data updated successfully")
                        .result(doctor)
                        .build());
    }

    @Operation(summary = "Update the doctor for mobile", description = "You have to add the all fields every time ")
    @PostMapping(
            path = "/doctor/update/mobile",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateDoctorForMobile(
            @RequestParam String updateDoctorRequest, @RequestParam(required = false) MultipartFile profileImage) {
        try {
            UpdateDoctorForMobile updateDoctor;
            ObjectMapper mapper = new ObjectMapper();
            try {
                updateDoctor = mapper.readValue(updateDoctorRequest, UpdateDoctorForMobile.class);
            } catch (JsonProcessingException e) {
                throw new InvalidRequestException(
                        ErrorCode.BAD_REQUEST,
                        "Invalid request String. An issue occurred while processing the request data.");
            }

            // invoice photo
            if (profileImage != null && !(profileImage.getOriginalFilename().length() == 0)) {
                String fileName = "";
                fileName =
                        fileService.uploadFile(profileImage, Feature.DOCTOR_PROFILE, updateDoctor.getDoctorId() + "");
                updateDoctor.setProfileImage(fileName);
            }

            Doctor doctor = doctorService.updateDoctorForMobile(updateDoctor, profileImage);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    "Doctor data updated successfully")
                            .result(doctor)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "The doctor's data was not updated. There appears to be an issue with the request data.")
                            .build());
        }
    }

    @PostMapping("/sign/up")
    public DoctorDetails signUp(@Valid @RequestBody AddDoctorRequest req) {
        DoctorDetails doctorDetails = doctorService.signUp(req);
        try {
            if (!doctorDetails.getProfiles().isEmpty()) {
                doctorDetails.getProfiles().forEach((profile) -> {
                    patientServiceClient.createCardDisplayConfig(
                            new CreateCardDisplayConfigRequestDto(profile.getProfileId()));
                });
            }
        } catch (Exception e) {
            log.error("Error while creating default card display config for doctor id: ", e);
        }
        return doctorDetails;
    }

    @PostMapping("/create-profile")
    public DoctorDetails createProfile(@Valid @RequestBody CreateUserProfile req) {
        Doctor doctor = doctorService.createProfile(req);
        try {
            if (!doctor.getUserProfiles().isEmpty()) {
                doctor.getUserProfiles().forEach((profile) -> {
                    patientServiceClient.createCardDisplayConfig(
                            new CreateCardDisplayConfigRequestDto(profile.getId()));
                });
            }
        } catch (Exception e) {
            log.error("Error while creating default card display config for doctor id: ", e);
        }
        return DoctorDetails.doctorDetails(doctor);
    }

    @PostMapping("/add/profile")
    public DoctorDetails signUp(@Valid @RequestBody AddProfileRequest req) {
        return DoctorDetails.doctorDetails(doctorService.addProfile(req));
    }

    @GetMapping
    public ResponseEntity<DoctorDetailsAll> getDoctor(
            @RequestParam(value = "doctor_id", required = false) Long doctorId) {

        DoctorDetailsAll doctor = doctorService.getDoctorAllDetails(doctorId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/details")
    public DoctorDetails getDoctorDetail(@RequestParam(value = "doctor_id", required = false) Long doctorId) {
        return doctorService.getDoctor(doctorId);
    }

    @GetMapping("/get/patients/doctor")
    public DoctorDetailsAll getDoctorForPatient(@RequestParam(value = "doctor_id", required = false) Long doctorId) {
        return doctorService.getDoctorAllDetails(doctorId);
    }

    @GetMapping("/get/doctor/for-patient")
    public ResponseEntity<DoctorDetailsAll> getDoctorForPatient(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId) {
        DoctorDetailsAll doctor = doctorService.getDoctorAllDetailsForPatient(doctorId, patientId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/email/{email_id}")
    public DoctorDetails getDoctorByEmail(@PathVariable("email_id") String emailId) {
        return doctorService.getDoctorByEmail(emailId);
    }

    @GetMapping("/doc-details")
    public DoctorDetails getDoctorDetails(
            @RequestParam(value = "emailId") String emailId,
            @RequestParam("organizationId") Long organizationId,
            @RequestParam("xOrgName") String xOrgName) {
        return doctorService.getDoctorDetails(emailId, organizationId, xOrgName);
    }

    @GetMapping("/emails")
    Map<String, DoctorDetails> getDoctorsByEmails(@RequestParam List<String> emails) {
        return doctorService.getDoctorsByEmails(emails);
    }

    @PostMapping("/create")
    public ResponseEntity<DoctorDetails> getOrCreateDoctor(@RequestBody DoctorGetRequest doctorGetRequest) {
        DoctorDetails doctor = doctorService.getOrCreateDoctor(
                doctorGetRequest.getEmail(), doctorGetRequest.getName(), doctorGetRequest.getLastName());
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/doctor/details/{doctorCodeEmailMobile}/{searchValueType}")
    public ResponseEntity<DoctorDetails> getDoctorDetailsByCode(
            @PathVariable(value = "doctorCodeEmailMobile") String doctorCodeEmailMobile,
            @PathVariable(value = "searchValueType") String searchValueType) {

        DoctorDetails doctorResponse =
                doctorService.getDoctorDetailsByEmailOrMobileOrCode(doctorCodeEmailMobile, searchValueType);

        return ResponseEntity.ok(doctorResponse);
    }

    @GetMapping("/get/details/{doctorId}/{patientId}")
    public DoctorForChatService getDoctorForChat(
            @PathVariable(value = "doctorId") Long doctorId, @PathVariable(value = "patientId") Long patientId) {
        return doctorService.getDoctorDetailsForChat(doctorId, patientId);
    }

    @GetMapping("/doctor/details")
    public DoctorDetails doctorDetailsForPatient(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId) {
        return doctorService.getDoctorFoPatient(doctorId, patientId);
    }

    @GetMapping("/get/by/mobile")
    public boolean findDoctorWithMobileNumber(
            @RequestParam(value = "doctor_mobile", required = false) String doctorMobile) {
        return doctorService.findDoctorWithMobileNumber(doctorMobile);
    }

    @GetMapping("/get/by/mobile/{doctorMobile}/org/{orgName}")
    public boolean findDoctorWithMobileNumberAndOrg(@PathVariable String doctorMobile, @PathVariable String orgName) {
        return doctorService.findDoctorWithMobileNumberAndOrg(doctorMobile, orgName);
    }
}
