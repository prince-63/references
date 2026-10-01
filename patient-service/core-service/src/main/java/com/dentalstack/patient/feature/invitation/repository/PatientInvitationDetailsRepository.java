package com.dentalstack.patient.feature.invitation.repository;

import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.search.projection.GlobalSearchLeadProjection;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientInvitationDetailsRepository extends JpaRepository<PatientInvitationDetails, Long> {
    Optional<PatientInvitationDetails> findByPatientId(Long id);

    @Query(
            "SELECT pid FROM PatientInvitationDetails pid LEFT JOIN FETCH pid.invitation LEFT JOIN FETCH pid.patient WHERE pid.patient.id = :patientId")
    Optional<PatientInvitationDetails> findByPatientIdWithInvitationAndPatient(@Param("patientId") Long patientId);

    void deleteAllByPatientId(Long patientId);

    @Query(
            """
        SELECT pid.invitation.id
        FROM PatientInvitationDetails pid
        WHERE pid.patient.id = :patientId
        """)
    Optional<Long> findInvitationIdByPatientId(@Param("patientId") Long patientId);

    Optional<PatientInvitationDetails> findByMobile(String mobile);

    Optional<PatientInvitationDetails> findByEmail(String email);

    @Query(
            value =
                    """
                        SELECT
                                        pid.id                         AS id,
                                        pid.patient_mapped_id          AS patientMappedId,
                                        pid.patient_id                 AS patientId,
                                        pid.invitation_id              AS invitationId,
                                        COALESCE(p.first_name, pid.first_name) AS firstName,
                                        COALESCE(p.last_name, pid.last_name)   AS lastName,
                                        COALESCE(p.email, pid.email)           AS email,
                                        COALESCE(p.mobile_no, pid.mobile)      AS mobile,
                                        pid.country_code               AS countryCode,
                                        pid.practice_location          AS practiceLocation,
                                        p.profile_picture_url          AS profileUrl,
                                        p.profile_image_id              AS profileImageId,
                                        pid.version                    AS version,
                                        pid.created_at                 AS createdAt,
                                        pid.updated_at                 AS updatedAt
                                    FROM invitation i
                                   INNER JOIN
                                       patient_invitation_details pid ON pid.invitation_id = i.id
                                   LEFT JOIN
                                       patient p ON p.id = pid.patient_id
                                   LEFT JOIN
                                       tracking t ON t.patient_id = pid.patient_id
                                   WHERE
                                       p.id IN :mappedPatientIds
                                       AND NOT (
                                               'UNASSIGNED' = ANY(p.product_type_names) AND
                                               ('BRACES' = ANY(p.product_type_names) OR 'ALIGNERS' = ANY(p.product_type_names))
                                           )
                                       AND (t.patient_id IS NULL OR t.status != 'ACTIVE')
                                       AND (
                                           CASE
                                               WHEN pid.first_name ILIKE CONCAT('%', :query, '%') THEN 1
                                               WHEN pid.last_name ILIKE CONCAT('%', :query, '%') THEN 1
                                               WHEN p.customer_mapped_id ILIKE CONCAT('%', :query, '%') THEN 1
                                               ELSE 0
                                           END +
                                           CASE
                                               WHEN pid.first_name ILIKE CONCAT('%', :query, '%') AND pid.last_name ILIKE CONCAT('%', :query, '%') THEN 1
                                               ELSE 0
                                           END
                                       ) > 0
                                   ORDER BY
                                       CASE
                                           WHEN pid.first_name ILIKE CONCAT('%', :query, '%') THEN 1
                                           WHEN pid.last_name ILIKE CONCAT('%', :query, '%') THEN 2
                                           WHEN p.customer_mapped_id ILIKE CONCAT('%', :query, '%') THEN 3
                                           ELSE 4
                                       END;
                    """,
            nativeQuery = true)
    List<GlobalSearchLeadProjection> findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedId(
            String query, List<Long> mappedPatientIds);
}
