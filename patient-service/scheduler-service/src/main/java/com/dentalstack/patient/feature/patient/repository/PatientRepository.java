package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.projection.LiveActivitySummary;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("SELECT p.id as id, p.email as email, p.language as language FROM Patient p WHERE p.email IS NOT NULL")
    Page<LiveActivitySummary> findAllPatientsWithEmail(Pageable pageable);

    @Query(
            """
SELECT p
FROM Patient p
LEFT JOIN FETCH p.doctorOrganization do
LEFT JOIN FETCH do.doctor d
LEFT JOIN FETCH do.organization o
LEFT JOIN FETCH do.userProfile up
LEFT JOIN FETCH up.organization op
LEFT JOIN FETCH up.user u
LEFT JOIN FETCH up.roles ur
LEFT JOIN FETCH up.doctorBilling udb
LEFT JOIN FETCH do.addedByUserProfile abup
LEFT JOIN FETCH abup.user abu
LEFT JOIN FETCH abup.roles abr
LEFT JOIN FETCH abup.doctorBilling adb
WHERE p.id = :id
""")
    Optional<Patient> findByIdWithDoctorProfileDetails(@Param("id") Long id);

    @Query(
            """
                        SELECT
                            p.id as patientId,
                            p.firstName as firstName,
                            p.lastName as lastName,
                            p.profilePictureUrl as profilePictureUrl,
                            p.practiceLocationId as practiceLocationId,
                            p.createdAt as createdAt,
                            p.addedByUserId as doctorId,
                            p.productTypeNames as productTypeNames,
                            p.practiceLocationName as practiceLocationName,
                            FUNCTION('array_agg', DISTINCT t.id) as treatments
                        FROM Patient p
                        LEFT JOIN p.treatments t
                        WHERE p.id IN :patientIds
                        AND (
                            :query IS NULL OR :query = '' OR (
                                LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                                OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
                                OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))
                                OR LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :query, '%'))
                                OR (
                                    LOWER(p.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :query, ' ', 1), '%'))
                                    AND LOWER(p.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :query, ' ', 2), '%'))
                                )
                            )
                        )
                        GROUP BY p.id, p.firstName, p.lastName, p.profilePictureUrl,
                                 p.practiceLocationId, p.createdAt, p.addedByUserId,
                                 p.productTypeNames, p.practiceLocationName
                        ORDER BY
                            CASE
                                WHEN :query IS NOT NULL AND :query != '' THEN (
                                    CASE
                                        WHEN LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) THEN 1
                                        WHEN LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) THEN 2
                                        WHEN LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) THEN 3
                                        WHEN LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :query, '%')) THEN 4
                                        ELSE 5
                                    END
                                )
                                ELSE 6
                            END
                    """)
    List<PatientSummary> findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedIdForPatientSummary(
            @Param("query") String query, @Param("patientIds") List<Long> patientIds);

    @Query("SELECT p.id FROM Patient p WHERE p.addedByUserId = :doctorId")
    List<Long> findPatientIdsByAddedByUserId(@Param("doctorId") Long doctorId);

    @Query(
            """
                        SELECT
                            p.id as patientId,
                            p.firstName as firstName,
                            p.lastName as lastName,
                            p.profilePictureUrl as profilePictureUrl,
                            p.practiceLocationId as practiceLocationId,
                            p.createdAt as createdAt,
                            p.addedByUserId as doctorId,
                            p.productTypeNames as productTypeNames,
                            p.practiceLocationName as practiceLocationName,
                            FUNCTION('array_agg', DISTINCT t.id) as treatments
                        FROM Patient p
                        LEFT JOIN p.treatments t
                        WHERE p.id IN :patientIds
                        GROUP BY p.id, p.firstName, p.lastName, p.profilePictureUrl,
                                 p.practiceLocationId, p.createdAt, p.addedByUserId,
                                 p.productTypeNames, p.practiceLocationName
                    """)
    List<PatientSummary> findByPatientIdsWithSummary(List<Long> patientIds);
}
