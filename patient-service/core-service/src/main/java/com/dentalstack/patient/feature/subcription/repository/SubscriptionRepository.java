package com.dentalstack.patient.feature.subcription.repository;

import com.dentalstack.patient.feature.storage.migration.enums.DriveMigrationStatus;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionPlan, Long> {

    @Modifying
    @Transactional
    @Query(
            """
        UPDATE SubscriptionPlan sp
        SET sp.gDriveMigrationStatus = :status
        WHERE EXISTS (
            SELECT 1 FROM SubscriptionUserMapping s
            WHERE s.subscriptionPlan = sp AND s.userProfileId = :userProfileId
        )
    """)
    void changeDriveStatus(@Param("userProfileId") Long userProfileId, DriveMigrationStatus status);

    @Query(
            """
        SELECT sp.gDriveMigrationStatus
        FROM SubscriptionPlan sp
        WHERE EXISTS (
            SELECT 1 FROM SubscriptionUserMapping s
            WHERE s.subscriptionPlan = sp AND s.userProfileId = :userProfileId
        )
    """)
    Optional<DriveMigrationStatus> findDriveStatusByUserProfileId(@Param("userProfileId") Long userProfileId);

    @Modifying
    @Transactional
    @Query(
            """
        UPDATE SubscriptionPlan sp
        SET sp.isGDrivePlatformAuthenticated = true
        WHERE EXISTS (
            SELECT 1 FROM SubscriptionUserMapping s
            WHERE s.subscriptionPlan = sp AND s.userProfileId = :userProfileId
        )
    """)
    void updateDriveAuthenticatedStatusById(@Param("userProfileId") Long userProfileId);

    @Query(
            """
    SELECT sp.totalOrders
    FROM SubscriptionPlan sp
    JOIN SubscriptionUserMapping sum ON sp.id = sum.subscriptionPlan.id
    WHERE sum.doctorId = :doctorId
    AND sum.userProfileId = :userProfileId
    """)
    Integer findTotalOrdersByDoctorIdAndUserProfileId(
            @Param("doctorId") Long doctorId, @Param("userProfileId") Long userProfileId);
}
