package com.dentalstack.patient.feature.migration.controller;

import com.dentalstack.patient.feature.migration.service.FilePathMigrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/files/migration")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Path Migration", description = "APIs for migrating file paths to remove last names")
public class FilePathMigrationController {

    private final FilePathMigrationService migrationService;

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get migration statistics", description = "Returns statistics about files that need migration")
    public ResponseEntity<Map<String, Object>> getMigrationStatistics() {
        log.info("Getting migration statistics");
        Map<String, Object> stats = migrationService.getMigrationStatistics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/dry-run")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Perform dry run migration",
            description = "Simulates the migration without making actual changes")
    public ResponseEntity<Map<String, Object>> performDryRun() {
        log.info("Starting dry run migration");
        Map<String, Object> result = migrationService.migrateFilePathsRemoveLastName(true);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    @Operation(
            summary = "Execute migration",
            description = "Executes the actual migration. This will modify database and storage!")
    public ResponseEntity<Map<String, Object>> executeMigration() {
        log.info("Starting actual migration - THIS WILL MODIFY DATA");
        Map<String, Object> result = migrationService.migrateFilePathsRemoveLastName(false);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/rollback")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    @Operation(summary = "Rollback migration", description = "Attempts to rollback migration for specified file IDs")
    public ResponseEntity<Map<String, Object>> rollbackMigration(@RequestBody List<Long> fileIds) {
        log.info("Starting rollback for {} files", fileIds.size());
        Map<String, Object> result = migrationService.rollbackMigration(fileIds);
        return ResponseEntity.ok(result);
    }
}
