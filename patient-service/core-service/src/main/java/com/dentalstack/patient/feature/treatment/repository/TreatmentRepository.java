package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.treatment.entity.Treatment;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {

    @Query("SELECT t FROM Treatment t WHERE t.patient.id IN (:patientIds)")
    List<Treatment> findTreatmentsByPatientIds(@Param("patientIds") List<Long> patientIds);
}
