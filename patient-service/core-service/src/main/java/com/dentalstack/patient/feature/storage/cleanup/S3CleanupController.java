package com.dentalstack.patient.feature.storage.cleanup;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "S3 Cleanup", description = "APIs for cleaning up migrated files from Amazon S3")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/s3/file-cleanup")
public class S3CleanupController {

    private final S3CleanupService cleanupService;

    @DeleteMapping("/cleanup/{profileId}")
    public void cleanupMigratedFiles(
            @Parameter(description = "User profile ID", required = true, example = "123") @PathVariable
                    Long profileId) {
        log.info("Received S3 cleanup request for profile ID: {}", profileId);
        cleanupService.cleanupMigratedByProfileId(profileId);
    }
}
