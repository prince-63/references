package com.dentalstack.doctor.repository.patient;

import com.dentalstack.doctor.entity.patient.Patient;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByMobileNo(String mobileNO);

    Optional<Patient> findByEmail(String email);

    @Query("SELECT p.id FROM Patient p")
    List<Long> findAllPatientId();

    @Query("SELECT p FROM Patient p WHERE p.id = :patientId")
    Patient findByPatientId(@Param("patientId") Long patientId);
}
