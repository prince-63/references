package com.dentalstack.patient.feature.caseinfo.repository;

import com.dentalstack.patient.feature.caseinfo.Metadata;
import com.dentalstack.patient.feature.caseinfo.entity.CaseInformation;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CaseInformationRepository extends JpaRepository<CaseInformation, Long> {

    Optional<CaseInformation> findByPatientIdAndDoctorId(Long patientId, Long doctorId);

    Optional<CaseInformation> findByPatientId(Long patientId);

    List<CaseInformation> findByDoctorId(Long doctorId);

    @Query("SELECT ci.metadata FROM CaseInformation ci WHERE ci.patientId = :patientId AND ci.doctorId = :doctorId")
    Optional<Metadata> findMetadataByPatientIdAndDoctorId(Long patientId, Long doctorId);

    @Query("SELECT COUNT(c) > 0 FROM CaseInformation c WHERE c.patientId = :patientId")
    boolean existsByPatientId(@Param("patientId") Long patientId);
}
