package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.dto.summary.PendingClaimSummary;
import com.dentalstack.patient.feature.rewards.entity.PatientPromotionRedemption;
import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;
import feign.Param;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PatientPromotionRedemptionRepository extends JpaRepository<PatientPromotionRedemption, Long> {
    long countByPatientIdAndPromotionConfigId(Long patientId, Long promotionId);

    @Query(
            """
            SELECT ppr FROM PatientPromotionRedemption ppr
            JOIN FETCH ppr.promotionConfig
            WHERE ppr.patient.id = :patientId
            AND (:status IS NULL OR ppr.status = :status)
            ORDER BY ppr.redeemedAt DESC
            """)
    List<PatientPromotionRedemption> findByPatientIdAndStatus(
            @Param("patientId") Long patientId, @Param("status") PromotionRedemptionStatus status);

    @Query(
            """
            SELECT ppr FROM PatientPromotionRedemption ppr
            WHERE ppr.patient.id = :patientId
            ORDER BY ppr.redeemedAt DESC
            """)
    List<PatientPromotionRedemption> findByPatientId(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
            SELECT
                ppr.id as redemptionId,
                pc.id as promotionId,
                pc.promotion_name as promotionName,
                pc.promotion_description as promotionDescription,
                pc.promotion_type as promotionType,
                ppr.coins_received as coinsReceived,
                ppr.status as status,
                ppr.redeemed_at as redeemedAt,
                p.id as patientId,
                p.first_name as patientFirstName,
                p.last_name as patientLastName,
                p.email as patientEmail,
                p.mobile_no as patientPhone,
                p.profile_picture_url as patientProfilePictureUrl,
                ppr.referred_patient_name as referredPatientName,
                ppr.referred_patient_phone as referredPatientPhone,
                ppr.referred_patient_email as referredPatientEmail,
                ppr.referred_patient_id as referredPatientId,
                ppr.verification_notes as verificationNotes
            FROM patient_promotion_redemption ppr
            INNER JOIN promotion_config pc ON ppr.promotion_config_id = pc.id
            INNER JOIN patient p ON ppr.patient_id = p.id
            INNER JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
            WHERE pdo.user_profile_id = :userProfileId
            AND pdo.active = true
            AND (:status IS NULL OR ppr.status = :status)
            AND (
                :searchText IS NULL OR :searchText = '' OR
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(pc.promotion_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :searchText, '%'))
            )
            ORDER BY ppr.redeemed_at DESC
            """,
            countQuery =
                    """
            SELECT COUNT(*)
            FROM patient_promotion_redemption ppr
            INNER JOIN promotion_config pc ON ppr.promotion_config_id = pc.id
            INNER JOIN patient p ON ppr.patient_id = p.id
            INNER JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
            WHERE pdo.user_profile_id = :userProfileId
            AND pdo.active = true
            AND (:status IS NULL OR ppr.status = :status)
            AND (
                :searchText IS NULL OR :searchText = '' OR
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(pc.promotion_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :searchText, '%'))
            )
            """,
            nativeQuery = true)
    Page<PendingClaimSummary> findPendingClaimsByUserProfileId(
            @Param("userProfileId") Long userProfileId,
            @Param("searchText") String searchText,
            @Param("status") String status,
            Pageable pageable);
}
