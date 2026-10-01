package com.dentalstack.doctor.controller.migration;

import com.dentalstack.doctor.service.migration.MigrationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Doctor migration", description = "Doctor migration APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/migration/v1/")
@Slf4j
public class MigrationController {

    private final MigrationService migrationService;

    @PostMapping("/migrate-doctor/{doctorId}")
    public void migrateDoctorData(@PathVariable Long doctorId) {
        migrationService.migrateDoctor(doctorId);
    }

    @PostMapping("/migrate-all-doctors")
    public void migrateDoctorData() {
        migrationService.migrateAllDoctors();
    }

    @PostMapping("/migrate-patient/{patientId}")
    public void migratePatientData(@PathVariable Long patientId) {
        migrationService.migratePatient(patientId);
    }

    @PostMapping("/migrate-practice-location/{practiceLocationId}")
    public void migratePracticeLocationData(@PathVariable Long practiceLocationId) {
        migrationService.migratePracticeLocation(practiceLocationId);
    }

    @PostMapping("/migrate-all-practice-locations")
    public void migratePatientData() {
        migrationService.migrateAllPracticeLocations();
    }

    @PostMapping("/migrate-all-patients")
    public void migrateAllPatients() {
        migrationService.migrateAllPatient();
    }
}
