package com.dentalstack.patient.feature.consent_template.repository;

import com.dentalstack.patient.feature.consent_template.entity.ConsentAcceptedRecord;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsentAcceptedRecordRepository extends JpaRepository<ConsentAcceptedRecord, Long> {
    @Query(
            """
    SELECT DISTINCT car FROM ConsentAcceptedRecord car
    JOIN FETCH car.consentTemplate ct
    WHERE car.acceptedFrom.id = :fromProfileId
      AND car.acceptedByPatient.id = :toPatientId
    """)
    List<ConsentAcceptedRecord> findByPatient(
            @Param("fromProfileId") Long fromProfileId, @Param("toPatientId") Long toPatientId);

    @Query(
            """
    SELECT DISTINCT car FROM ConsentAcceptedRecord car
    JOIN FETCH car.consentTemplate ct
    WHERE car.acceptedFrom.id = :fromProfileId
      AND car.acceptedBy.id = :toProfileId
    """)
    List<ConsentAcceptedRecord> findByCustomer(
            @Param("fromProfileId") Long fromProfileId, @Param("toProfileId") Long toProfileId);
}
