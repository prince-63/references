package com.dentalstack.patient.feature.workflow.pre_treatment.repository;

import com.dentalstack.patient.feature.workflow.pre_treatment.entity.PatientPreTreatmentDetails;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientPreTreatmentRepository extends JpaRepository<PatientPreTreatmentDetails, Long> {

    List<PatientPreTreatmentDetails> findByPatientId(Long patientId);

    @Query("SELECT pptd FROM PatientPreTreatmentDetails pptd "
            + "LEFT JOIN FETCH pptd.patient p "
            + "LEFT JOIN FETCH pptd.addedBy ab "
            + "LEFT JOIN FETCH ab.user u "
            + "LEFT JOIN FETCH pptd.caseRecord cr "
            + "LEFT JOIN FETCH pptd.prescription pr "
            + "WHERE pptd.patient.id = :patientId AND pptd.isActive = true")
    Optional<PatientPreTreatmentDetails> findByPatientIdAndActive(@Param("patientId") Long patientId);

    @Query(
            "SELECT pptd FROM PatientPreTreatmentDetails pptd WHERE pptd.patient.id = :patientId AND pptd.isActive = true")
    List<PatientPreTreatmentDetails> findAllByPatientIdAndActive(
            @Param("patientId") @NotNull(message = "Patient ID is required") Long patientId);

    void deleteAllByPatientId(Long patientId);
}
