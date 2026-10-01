package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.vsp.entity.VspShippingDetails;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VspShippingDetailsRepository extends JpaRepository<VspShippingDetails, String> {
    @Modifying
    @Query(
            "UPDATE VspShippingDetails s SET s.isDefault = false WHERE s.profileId = :profileId AND s.customerProfileId = :customerProfileId AND s.isDefault = true")
    void updatePreviousDefaultShippingDetails(
            @Param("profileId") Long profileId, @Param("customerProfileId") Long customerProfileId);

    List<VspShippingDetails> findByProfileIdOrderByIsDefaultDescCreatedAtDesc(Long profileId);

    Optional<VspShippingDetails> findFirstByProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(Long profileId);

    Optional<VspShippingDetails> findFirstByProfileIdAndCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
            Long profileId, Long customerProfileId);

    Optional<VspShippingDetails> findFirstByCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
            Long customerProfileId);
}
