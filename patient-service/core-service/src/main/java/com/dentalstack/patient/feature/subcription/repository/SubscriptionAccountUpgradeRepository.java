package com.dentalstack.patient.feature.subcription.repository;

import com.dentalstack.patient.feature.subcription.entity.SubscriptionAccountUpgrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionAccountUpgradeRepository extends JpaRepository<SubscriptionAccountUpgrade, Long> {}
