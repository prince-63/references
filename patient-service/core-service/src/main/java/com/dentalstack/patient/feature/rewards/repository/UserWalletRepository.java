package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.dto.summary.PatientRewardSummary;
import com.dentalstack.patient.feature.rewards.dto.summary.RewardDashboardStats;
import com.dentalstack.patient.feature.rewards.entity.UserWallet;
import feign.Param;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {

    Optional<UserWallet> findByPatientId(Long patientId);

    @Query(
            value =
                    """
            SELECT
                p.id as patientId,
                p.first_name as firstName,
                p.last_name as lastName,
                p.email as email,
                p.customer_mapped_id as customerMappedId,
                p.uuid as uuid,
                p.profile_picture_url as profilePictureUrl,
                p.profile_image_id as profilePictureId,
                COALESCE(uw.lifetime_earned, 0) as coinsEarned,
                COALESCE(uw.lifetime_spent, 0) as coinsUsed
            FROM patient p
            INNER JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
            INNER JOIN user_wallet uw ON p.id = uw.patient_id
            WHERE pdo.user_profile_id = :userProfileId
            AND pdo.active = true
            AND (
                :searchText IS NULL OR :searchText = '' OR
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :searchText, '%'))
            )
            ORDER BY p.first_name ASC, p.last_name ASC
        """,
            countQuery =
                    """
            SELECT COUNT(*)
            FROM patient p
            INNER JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
            INNER JOIN user_wallet uw ON p.id = uw.patient_id
            WHERE pdo.user_profile_id = :userProfileId
            AND pdo.active = true
            AND (
                :searchText IS NULL OR :searchText = '' OR
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :searchText, '%'))
            )
        """,
            nativeQuery = true)
    Page<PatientRewardSummary> findPatientRewardsByUserProfileId(
            @Param("userProfileId") Long userProfileId, @Param("searchText") String searchText, Pageable pageable);

    @Query(
            value =
                    """
    SELECT
        COUNT(DISTINCT p.id) as activePatient,
        COALESCE(SUM(uw.lifetime_spent), 0) as coinRedeemed,
        COALESCE(
            COUNT(DISTINCT p.id) *
            COALESCE((
                SELECT SUM(rtc.coin_reward)
                FROM reward_task_config rtc
                WHERE rtc.user_profile_id = :profileId
                AND rtc.is_active = true
            ), 0),
        0) as coinDistributed
    FROM patient_doctor_organization pdo
    JOIN patient p ON pdo.patient_id = p.id
    INNER JOIN user_wallet uw ON uw.patient_id = p.id AND uw.is_active = true
    WHERE pdo.user_profile_id = :profileId
    AND pdo.active = true
    """,
            nativeQuery = true)
    RewardDashboardStats getPatientRewardDashboardStats(@Param("profileId") Long profileId);
}
