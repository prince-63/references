package com.dentalstack.doctor.service.migration;

public interface MigrationService {
    void migrateDoctor(Long doctorId);

    void migratePracticeLocation(Long practiceLocationId);

    void migrateAllDoctors();

    void migrateAllPracticeLocations();

    void migrateAllPatient();

    void migratePatient(Long patientId);
}
