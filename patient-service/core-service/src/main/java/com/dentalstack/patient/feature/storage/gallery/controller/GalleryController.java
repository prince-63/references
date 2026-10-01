package com.dentalstack.patient.feature.storage.gallery.controller;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.storage.gallery.dto.AddAlignerPhotoRequest;
import com.dentalstack.patient.feature.storage.gallery.dto.AddPreAlignerPhotoRequest;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotos;
import com.dentalstack.patient.feature.storage.gallery.dto.DeleteAlignerPhotosRequest;
import com.dentalstack.patient.feature.storage.gallery.exception.FailedToParseAlignerPhotoDetails;
import com.dentalstack.patient.feature.storage.gallery.service.GalleryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Gallery", description = "Gallery APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/gallery/v1")
public class GalleryController {
    private final GalleryService galleryService;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(
            value = "/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Upload aligner photo")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> uploadAlignerPhoto(
            @Parameter(
                            name = "details",
                            example =
                                    """
 {
  "aligner_journey_id": 1,
  "aligner_no": 1,
  "with_aligner": true,
  "description": "Good results",
  "user_type": "PATIENT",
  "user_id": 1,
  "photo_files": [{"original_filename": "1.png", "save_as_filename": "2.png"}]
}
""")
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        AddAlignerPhotoRequest request = new AddAlignerPhotoRequest();
        try {
            request = mapper.readValue(reqStr, AddAlignerPhotoRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse galley image details, {}", reqStr);
            throw new FailedToParseAlignerPhotoDetails(reqStr, e);
        }

        AlignerJourney alignerJourney = galleryService.uploadAlignerPhoto(
                request, photo, request.saveAsFilename(photo.getOriginalFilename()), true);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping(
            value = "/photos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Upload aligner photos")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> uploadAlignerPhotos(
            @Parameter(
                            name = "details",
                            example =
                                    """
 {
  "aligner_journey_id": 1,
  "aligner_no": 1,
  "with_aligner": true,
  "description": "Good results",
  "user_type": "PATIENT",
  "user_id": 1,
  "photo_files": [{"original_filename": "1.png", "save_as_filename": "2.png"}]
}
""")
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile[] photos) {
        AddAlignerPhotoRequest request = new AddAlignerPhotoRequest();
        try {
            request = mapper.readValue(reqStr, AddAlignerPhotoRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse galley image details, {}", reqStr);
            throw new FailedToParseAlignerPhotoDetails(reqStr, e);
        }

        AlignerJourney alignerJourney = galleryService.uploadAlignerPhotos(request, photos);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping(
            value = "/photos/pre-aligner",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Upload pre-aligner photos")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> uploadPreAlignerPhotos(
            @Parameter(
                            name = "details",
                            example =
                                    """
         {
          "aligner_journey_id": 1,
          "description": "Good results",
          "user_type": "PATIENT",
          "user_id": 1
        }
        """)
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile[] photos) {
        AddPreAlignerPhotoRequest request = new AddPreAlignerPhotoRequest();
        try {
            request = mapper.readValue(reqStr, AddPreAlignerPhotoRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse galley image details, {}", reqStr);
            throw new FailedToParseAlignerPhotoDetails(reqStr, e);
        }

        AlignerJourney alignerJourney = galleryService.uploadPreAlignerPhotos(request, photos);

        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @GetMapping("/photo/{patient_id}")
    @Operation(summary = "Get all the photos uploaded for the active aligner journey of the patient.")
    public ResponseEntity<AlignerPhotos> getAlignerPhoto(@PathVariable("patient_id") Long patientId) {
        return ResponseEntity.ok(AlignerPhotos.from(galleryService.getAlignerPhotos(patientId)));
    }

    @PostMapping("/photo/delete")
    @Operation(summary = "Delete aligner photos of the active aligner journey of the patient")
    public ResponseEntity<AlignerPhotos> deleteAlignerPhoto(@RequestBody DeleteAlignerPhotosRequest request) {
        return ResponseEntity.ok(AlignerPhotos.from(galleryService.deleteAlignerPhoto(request)));
    }
}
