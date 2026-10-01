package com.dentalstack.patient.feature.subcription.repository;

import com.dentalstack.patient.feature.subcription.entity.SubscriptionUserMapping;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionUserMappingRepository extends JpaRepository<SubscriptionUserMapping, Long> {
    Optional<SubscriptionUserMapping> findByDoctorIdAndUserProfileId(Long doctorId, Long userProfileId);

    List<SubscriptionUserMapping> findByDoctorId(Long doctorId);

    @Query(
            "SELECT sum FROM SubscriptionUserMapping sum LEFT JOIN FETCH sum.subscriptionPlan WHERE sum.doctorId = :doctorId")
    List<SubscriptionUserMapping> findByDoctorIdWithSubscriptionPlan(@Param("doctorId") Long doctorId);

    Optional<SubscriptionUserMapping> findByUserProfileId(Long userProfileId);

    Page<SubscriptionUserMapping> findDistinctByIsAdmin(boolean isAdmin, Pageable pageable);

    @Query("SELECT sum FROM SubscriptionUserMapping sum " + "LEFT JOIN FETCH sum.subscriptionPlan sp "
            + "WHERE sum.userProfileId = :profileId"
            + " AND sum.doctorId = :doctorId")
    SubscriptionUserMapping findByDoctorIdAndUserProfileIdWithSubscriptionPlan(
            @Param("profileId") Long profileId, @Param("doctorId") Long doctorId);
}
