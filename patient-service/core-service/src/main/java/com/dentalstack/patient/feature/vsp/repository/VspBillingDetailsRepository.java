package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.vsp.entity.VspBillingDetails;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VspBillingDetailsRepository extends JpaRepository<VspBillingDetails, String> {
    @Modifying
    @Query(
            "UPDATE VspBillingDetails b SET b.isDefault = false WHERE b.profileId = :profileId AND b.customerProfileId = :customerProfileId AND b.isDefault = true")
    void updatePreviousDefaultBillingDetails(
            @Param("profileId") Long profileId, @Param("customerProfileId") Long customerProfileId);

    List<VspBillingDetails> findByProfileIdOrderByIsDefaultDescCreatedAtDesc(Long profileId);

    Optional<VspBillingDetails> findFirstByProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(Long profileId);

    Optional<VspBillingDetails> findFirstByProfileIdAndCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
            Long profileId, Long customerProfileId);

    Optional<VspBillingDetails> findFirstByCustomerProfileIdAndIsDefaultTrueOrderByCreatedAtDesc(
            Long customerProfileId);
}
