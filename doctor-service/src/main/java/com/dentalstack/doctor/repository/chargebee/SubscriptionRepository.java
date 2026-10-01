package com.dentalstack.doctor.repository.chargebee;

import com.dentalstack.doctor.entity.subscription.SubscriptionPlan;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByBrand(String brand);
}
