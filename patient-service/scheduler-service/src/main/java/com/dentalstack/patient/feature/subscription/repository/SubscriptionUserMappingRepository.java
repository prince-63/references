package com.dentalstack.patient.feature.subscription.repository;

import com.dentalstack.patient.feature.subscription.entity.SubscriptionUserMapping;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionUserMappingRepository extends JpaRepository<SubscriptionUserMapping, Long> {
    List<SubscriptionUserMapping> findByDoctorId(Long doctorId);

    Page<SubscriptionUserMapping> findDistinctByIsAdmin(boolean isAdmin, Pageable pageable);

    Optional<SubscriptionUserMapping> findByDoctorIdAndUserProfileId(Long doctorId, Long userProfileId);
}
