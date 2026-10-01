package com.dentalstack.patient.feature.prescription.repository;

import com.dentalstack.patient.feature.prescription.entity.Prescription;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    @Query(
            value =
                    """
                SELECT *
                FROM prescription AS p
                WHERE p.patient_id = :patientId
                ORDER BY p.created_at DESC;
            """,
            nativeQuery = true)
    List<Prescription> findByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT p FROM Prescription p
    LEFT JOIN FETCH p.patient pat
    WHERE p.id = :prescriptionId
    """)
    Optional<Prescription> findByPrescriptionId(Long prescriptionId);

    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.patient.id = :patientId")
    int countByPatientId(@Param("patientId") Long patientId);

    void deleteAllByPatientId(Long patientId);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.orderId = :orderId")
    List<Prescription> findByPatientIdAndOrderId(@Param("patientId") Long patientId, @Param("orderId") String orderId);
}
