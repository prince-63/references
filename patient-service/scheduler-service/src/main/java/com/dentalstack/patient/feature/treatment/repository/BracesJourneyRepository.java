package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.doctor.projection.BracesJourneySummary;
import com.dentalstack.patient.feature.treatment.entity.BracesJourney;
import com.dentalstack.patient.feature.treatment.enums.BracesTreatmentStage;
import feign.Param;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BracesJourneyRepository extends JpaRepository<BracesJourney, Long> {

    @Query("SELECT bj.patient.id AS patientId, bj.bracesTreatmentStage AS bracesTreatmentStage, "
            + "COUNT(a.id) AS appointmentCount "
            + "FROM BracesJourney bj "
            + "LEFT JOIN bj.appointments a "
            + "WHERE bj.patient.id IN :patientIds AND bj.bracesTreatmentStage IN :stages "
            + "GROUP BY bj.patient.id, bj.bracesTreatmentStage")
    List<BracesJourneySummary> findBracesJourneySummariesByCriteria(
            @Param("patientIds") Set<Long> patientIds, @Param("stages") Collection<BracesTreatmentStage> stages);
}
