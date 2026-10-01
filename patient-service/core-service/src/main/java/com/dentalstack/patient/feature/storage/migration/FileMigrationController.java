package com.dentalstack.patient.feature.storage.migration;

import com.dentalstack.patient.feature.storage.migration.dto.MigrationStatus;
import com.dentalstack.patient.feature.storage.migration.service.FileMigrationProducerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/drive/file-migration")
@Tag(name = "File Migration", description = "APIs for managing file migration from S3 to Google Drive")
public class FileMigrationController {

    private final FileMigrationProducerService producerService;

    @Deprecated
    @PostMapping("/migrate/{profileId}")
    @Operation(
            summary = "Deprecated: Start file migration",
            description = "Deprecated endpoint. Returns dummy response only.",
            deprecated = true)
    public ResponseEntity<Map<String, String>> migrateFiles(
            @Parameter(description = "User profile ID", required = true, example = "123") @PathVariable
                    Long profileId) {
        String jobId = "deprecated-job-" + profileId;
        String progressUrl = String.format("/patient/drive/file-migration/progress/%s", jobId);
        Map<String, String> body = Map.of(
                "jobId", jobId,
                "progressUrl", progressUrl,
                "message", "This endpoint is deprecated and returns dummy data");
        log.warn("Deprecated endpoint called: /migrate/{}", profileId);
        return ResponseEntity.ok(body);
    }

    @Deprecated
    @PostMapping("/manually/migrate/{profileId}")
    @Operation(
            summary = "Deprecated: Manual migration",
            description = "Deprecated endpoint. Returns dummy response only.",
            deprecated = true)
    public ResponseEntity<Map<String, String>> manullyMigrateFiles(
            @Parameter(description = "User profile ID", required = true, example = "123") @PathVariable
                    Long profileId) {
        log.warn("Deprecated endpoint called: /manually/migrate/{}", profileId);
        return ResponseEntity.ok(Map.of(
                "message",
                "This endpoint is deprecated and returns dummy data",
                "profileId",
                String.valueOf(profileId)));
    }

    @Deprecated
    @GetMapping("/progress/{jobId}")
    @Operation(
            summary = "Deprecated: Get migration progress",
            description = "Deprecated endpoint. Returns dummy response only.",
            deprecated = true)
    public ResponseEntity<Map<String, String>> getProgress(
            @Parameter(description = "Migration job id", required = true) @PathVariable String jobId) {
        log.warn("Deprecated endpoint called: /progress/{}", jobId);
        return ResponseEntity.ok(Map.of(
                "jobId", jobId,
                "status", "DEPRECATED",
                "message", "This endpoint is deprecated and returns dummy data"));
    }

    @PostMapping("/profile/{profileId}")
    public ResponseEntity<String> migrate(@PathVariable Long profileId) {
        return ResponseEntity.ok(producerService.startMigration(profileId));
    }

    @PostMapping("/profile/move/{profileId}")
    public ResponseEntity<String> moveFile(@PathVariable Long profileId) {
        return ResponseEntity.ok(producerService.startMovingFile(profileId));
    }

    @PostMapping("/profile/status/{profileId}")
    public ResponseEntity<MigrationStatus> checkMigrationStatus(@PathVariable Long profileId) {
        return ResponseEntity.ok(producerService.getMigrationStatus(profileId));
    }
}
