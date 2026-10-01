package com.dentalstack.patient.feature.bulkupload.controller;

import com.dentalstack.patient.feature.bulkupload.service.BulkUploadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Bulk upload", description = "Bulk upload APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/bulk/upload/v1")
@Slf4j
public class BulkUploadController {

    private final BulkUploadService bulkUploadService;

    @PostMapping("/import/treatment-plan")
    public ResponseEntity<String> importTreatmentPlan() {
        try {
            bulkUploadService.importTreatmentPlansFromSheet(
                    "1HfYcq0jYMwFQNIE75PxiBBq2UoLq0s9KV7rMWJd4Ca4", "Smilezy Bulk upload!A1:M100");
            return ResponseEntity.ok("Import completed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Import failed: " + e.getMessage());
        }
    }
}
