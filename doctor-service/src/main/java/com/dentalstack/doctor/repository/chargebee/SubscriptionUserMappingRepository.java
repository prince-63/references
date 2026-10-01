package com.dentalstack.doctor.repository.chargebee;

import com.dentalstack.doctor.entity.subscription.SubscriptionUserMapping;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionUserMappingRepository extends JpaRepository<SubscriptionUserMapping, Long> {
    Optional<SubscriptionUserMapping> findByDoctorIdAndUserProfileId(Long doctorId, Long userProfileId);

    List<SubscriptionUserMapping> findByDoctorId(Long doctorId);

    Optional<SubscriptionUserMapping> findByUserProfileId(Long userProfileId);

    @Query(
            value =
                    """
    SELECT s.plan_metadata ->> 'planName'
    FROM subscription_user_mapping sum
    JOIN subscription s ON sum.subscription_plan_id = s.id
    WHERE sum.doctor_id = :doctorId
    """,
            nativeQuery = true)
    String findPlanNameByDoctorId(long doctorId);
}
