package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.ProfileImage;
import com.dentalstack.patient.feature.patient.service.PatientProfileV2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.IOUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@Tag(name = "profile", description = "Patient profile APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/profile/v2")
public class PatientProfileV2Controller {

    private final PatientProfileV2Service patientProfileV2Service;

    @PostMapping(
            value = "/{patient_id}/profile_picture",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update profile picture of the patient")
    public ResponseEntity<PatientDetails> updateProfilePicture(
            @PathVariable("patient_id") Long patientId, @RequestPart("photo") MultipartFile photo) {
        return ResponseEntity.ok(patientProfileV2Service.updateProfilePictureAndGetDetails(patientId, photo));
    }

    @PostMapping(
            value = "/update_profile_picture/{patient_id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update profile picture of the patient using blob storage")
    public ResponseEntity<PatientDetails> updateProfilePictureUsingBlob(
            @PathVariable("patient_id") Long patientId, @RequestPart("photo") MultipartFile photo) {
        return ResponseEntity.ok(patientProfileV2Service.updateProfilePictureUsingBlobAndGetDetails(patientId, photo));
    }

    @GetMapping(value = "/get/profile_picture/{profile_picture_id}", produces = MediaType.ALL_VALUE)
    public ResponseEntity<StreamingResponseBody> getProfileImage(
            @PathVariable(name = "profile_picture_id") Long profilePictureId) {
        ProfileImage image = patientProfileV2Service
                .findByProfilePictureId(profilePictureId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        StreamingResponseBody stream = outputStream -> {
            try (InputStream is = new ByteArrayInputStream(image.getImageData())) {
                IOUtils.copy(is, outputStream);
            }
        };

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + image.getImageName() + "\"")
                .cacheControl(CacheControl.noCache())
                .body(stream);
    }
}
