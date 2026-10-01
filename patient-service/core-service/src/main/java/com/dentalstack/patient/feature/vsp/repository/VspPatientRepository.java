package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.vsp.projection.VspPatientListSummary;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VspPatientRepository extends JpaRepository<Patient, Long> {

    @Query(
            value =
                    """
SELECT id
FROM (
    SELECT DISTINCT ON (p.id)
        p.id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        p.practice_location_name,
        p.customer_mapped_id,
        sp.product_name,
        CAST(latest_vo.status AS TEXT) AS vsp_order_status,
        CASE
            WHEN latest_vo.updated_at IS NULL THEN p.updated_at
            ELSE GREATEST(latest_vo.updated_at, p.updated_at)
        END AS last_updated,
        CASE
            WHEN COALESCE(vsp_order_counts.total_orders, 0) > 1 THEN 'REFINEMENT'
            ELSE 'INITIAL'
        END AS case_type_val
    FROM patient p
    JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
    LEFT JOIN LATERAL (
        SELECT vo.*
        FROM vsp_order vo
        WHERE vo.patient_id = p.id
        ORDER BY vo.created_at DESC
        LIMIT 1
    ) latest_vo ON true
    LEFT JOIN service_products sp
        ON latest_vo.id IS NOT NULL
        AND latest_vo.service_product_id = sp.id
    LEFT JOIN (
        SELECT patient_id, COUNT(*) AS total_orders
        FROM vsp_order
        GROUP BY patient_id
    ) vsp_order_counts ON vsp_order_counts.patient_id = p.id
    WHERE pdo.organization_id = :organizationId
    AND pdo.user_profile_id   = :profileId
    AND p.patient_status      != 'ARCHIVE'
    AND (:practiceLocationId IS NULL OR p.practice_location_id = :practiceLocationId)
    AND (:clinicId IS NULL OR p.practice_location_id = :clinicId)
    AND (:customerMappedId IS NULL OR p.customer_mapped_id = :customerMappedId)
    AND (
        :search IS NULL OR :search = '' OR
        LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :search, '%'))
    )
    AND (:productId IS NULL OR (latest_vo.id IS NOT NULL AND latest_vo.service_product_id = :productId))
    AND (
        :#{#vspOrderStatuses.size()} = 0
        OR (
            :isDraftRequested = true
            AND (latest_vo.id IS NULL OR CAST(latest_vo.status AS TEXT) IN (:vspOrderStatuses))
        )
        OR (
            :isDraftRequested = false
            AND latest_vo.id IS NOT NULL
            AND CAST(latest_vo.status AS TEXT) IN (:vspOrderStatuses)
        )
    )
    AND (
        :caseType IS NULL OR
        (:caseType = 'INITIAL' AND COALESCE(vsp_order_counts.total_orders, 0) <= 1) OR
        (:caseType = 'REFINEMENT' AND COALESCE(vsp_order_counts.total_orders, 0) > 1)
    )
    ORDER BY p.id, last_updated DESC
) sub

ORDER BY
    CASE WHEN :sortBy = 'patient' AND :sortDirection = 'ASC'  THEN patient_name END ASC,
    CASE WHEN :sortBy = 'patient' AND :sortDirection = 'DESC' THEN patient_name END DESC,
    CASE WHEN :sortBy = 'clinic' AND :sortDirection = 'ASC'  THEN practice_location_name END ASC,
    CASE WHEN :sortBy = 'clinic' AND :sortDirection = 'DESC' THEN practice_location_name END DESC,
    CASE WHEN :sortBy = 'id' AND :sortDirection = 'ASC'  THEN customer_mapped_id END ASC,
    CASE WHEN :sortBy = 'id' AND :sortDirection = 'DESC' THEN customer_mapped_id END DESC,
    CASE WHEN :sortBy = 'product' AND :sortDirection = 'ASC'  THEN product_name END ASC,
    CASE WHEN :sortBy = 'product' AND :sortDirection = 'DESC' THEN product_name END DESC,
    CASE WHEN :sortBy = 'caseType' AND :sortDirection = 'ASC'  THEN case_type_val END ASC,
    CASE WHEN :sortBy = 'caseType' AND :sortDirection = 'DESC' THEN case_type_val END DESC,
    CASE WHEN :sortBy = 'status' AND :sortDirection = 'ASC'  THEN vsp_order_status END ASC,
    CASE WHEN :sortBy = 'status' AND :sortDirection = 'DESC' THEN vsp_order_status END DESC,
    CASE WHEN :sortBy = 'lastUpdated' AND :sortDirection = 'ASC'  THEN last_updated END ASC,
    CASE WHEN :sortBy = 'lastUpdated' AND :sortDirection = 'DESC' THEN last_updated END DESC,
    last_updated DESC,
    id DESC
LIMIT :limit OFFSET :offset
""",
            nativeQuery = true)
    List<Long> findVspPatientIdsWithFilters(
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("practiceLocationId") Long practiceLocationId,
            @Param("clinicId") Long clinicId,
            @Param("customerMappedId") String customerMappedId,
            @Param("search") String search,
            @Param("productId") Long productId,
            @Param("vspOrderStatuses") List<String> vspOrderStatuses,
            @Param("isDraftRequested") boolean isDraftRequested,
            @Param("caseType") String caseType,
            @Param("sortBy") String sortBy,
            @Param("sortDirection") String sortDirection,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query(
            value =
                    """
    SELECT COUNT(DISTINCT p.id)
    FROM patient p
    JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id

    LEFT JOIN LATERAL (
        SELECT vo.*
        FROM vsp_order vo
        WHERE vo.patient_id = p.id
        ORDER BY vo.created_at DESC
        LIMIT 1
    ) latest_vo ON true

    LEFT JOIN (
        SELECT patient_id, COUNT(*) AS total_orders
        FROM vsp_order
        GROUP BY patient_id
    ) vsp_order_counts ON vsp_order_counts.patient_id = p.id

    WHERE pdo.organization_id = :organizationId
    AND pdo.user_profile_id   = :profileId
    AND p.patient_status      != 'ARCHIVE'

    AND (:practiceLocationId IS NULL OR p.practice_location_id = :practiceLocationId)
    AND (:clinicId IS NULL OR p.practice_location_id = :clinicId)
    AND (:customerMappedId IS NULL OR p.customer_mapped_id = :customerMappedId)

    AND (
        :search IS NULL OR :search = '' OR
        LOWER(p.first_name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.last_name)          LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.email)              LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :search, '%'))
    )

    AND (:productId IS NULL OR (latest_vo.id IS NOT NULL AND latest_vo.service_product_id = :productId))

    AND (
        :#{#vspOrderStatuses.size()} = 0
        OR (
            :isDraftRequested = true
            AND (latest_vo.id IS NULL OR CAST(latest_vo.status AS TEXT) IN (:vspOrderStatuses))
        )
        OR (
            :isDraftRequested = false
            AND latest_vo.id IS NOT NULL
            AND CAST(latest_vo.status AS TEXT) IN (:vspOrderStatuses)
        )
    )

    AND (
        :caseType IS NULL OR
        (:caseType = 'INITIAL'    AND COALESCE(vsp_order_counts.total_orders, 0) <= 1) OR
        (:caseType = 'REFINEMENT' AND COALESCE(vsp_order_counts.total_orders, 0) >  1)
    )
    """,
            nativeQuery = true)
    long countVspPatientIdsWithFilters(
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("practiceLocationId") Long practiceLocationId,
            @Param("clinicId") Long clinicId,
            @Param("customerMappedId") String customerMappedId,
            @Param("search") String search,
            @Param("productId") Long productId,
            @Param("vspOrderStatuses") List<String> vspOrderStatuses,
            @Param("isDraftRequested") boolean isDraftRequested,
            @Param("caseType") String caseType);

    @Query(
            value =
                    """
    SELECT
        p.id                                                        AS patientId,
        p.first_name                                                AS firstName,
        p.last_name                                                 AS lastName,
        CONCAT(p.first_name, ' ', p.last_name)                     AS fullName,
        p.email                                                     AS email,
        p.mobile_no                                                 AS mobileNo,
        p.profile_picture_url                                       AS profilePictureUrl,
        p.customer_mapped_id                                        AS customerMappedId,
        p.practice_location_id                                      AS practiceLocationId,
        p.practice_location_name                                    AS practiceLocationName,
        p.country_code                                              AS countryCode,
        p.created_at                                                AS createdAt,
        p.updated_at                                                AS patientUpdatedAt,

        latest_vo.id                                                AS latestVspOrderId,
        sp.product_name                                             AS productName,
        CAST(latest_vo.status AS TEXT)                              AS vspOrderStatus,
        latest_vo.updated_at                                        AS vspOrderUpdatedAt,

        CASE
            WHEN vsp_order_counts.total_orders > 1 THEN 'REFINEMENT'
            ELSE 'INITIAL'
        END                                                         AS caseType,

        CASE
            WHEN latest_vo.updated_at IS NULL THEN p.updated_at
            ELSE GREATEST(latest_vo.updated_at, p.updated_at)
        END                                                         AS lastUpdated

    FROM patient p

    LEFT JOIN LATERAL (
        SELECT vo.*
        FROM vsp_order vo
        WHERE vo.patient_id = p.id
        ORDER BY vo.created_at DESC
        LIMIT 1
    ) latest_vo ON true

    LEFT JOIN service_products sp ON latest_vo.service_product_id = sp.id

    LEFT JOIN (
        SELECT patient_id, COUNT(*) AS total_orders
        FROM vsp_order
        GROUP BY patient_id
    ) vsp_order_counts ON vsp_order_counts.patient_id = p.id

    WHERE p.id IN (:patientIds)
    """,
            nativeQuery = true)
    List<VspPatientListSummary> findVspPatientSummariesByIds(@Param("patientIds") List<Long> patientIds);
}
