package com.dentalstack.patient.feature.order.repository;

import com.dentalstack.patient.feature.order.dto.ShippingDetails;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingDetailsRepository extends JpaRepository<ShippingDetails, Long> {
    @Modifying
    @Query("UPDATE ShippingDetails s SET s.isDefault = false WHERE s.profileId = :profileId AND s.isDefault = true")
    void updatePreviousDefaultShippingDetails(@Param("profileId") Long profileId);

    List<ShippingDetails> findByProfileIdOrderByIsDefaultDescCreatedAtDesc(Long profileId);

    Optional<ShippingDetails> findFirstByProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(Long profileId);

    Optional<ShippingDetails> findFirstByProfileIdAndCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
            Long profileId, Long customerProfileId);
}
