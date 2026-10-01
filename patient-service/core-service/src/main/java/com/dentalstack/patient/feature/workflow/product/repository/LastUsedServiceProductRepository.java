package com.dentalstack.patient.feature.workflow.product.repository;

import com.dentalstack.patient.feature.workflow.product.entity.LastUsedServiceProduct;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LastUsedServiceProductRepository extends JpaRepository<LastUsedServiceProduct, Long> {

    Optional<LastUsedServiceProduct> findByUserProfileId(Long userProfileId);
}
