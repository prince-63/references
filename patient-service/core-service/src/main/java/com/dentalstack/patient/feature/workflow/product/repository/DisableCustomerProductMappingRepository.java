package com.dentalstack.patient.feature.workflow.product.repository;

import com.dentalstack.patient.feature.workflow.product.entity.DisabledCustomerProductMapping;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DisableCustomerProductMappingRepository extends JpaRepository<DisabledCustomerProductMapping, Long> {

    @Query(
            """
    SELECT dcpm
    FROM DisabledCustomerProductMapping dcpm
    WHERE dcpm.ownerProfile.id = :ownerProfileId
      AND dcpm.organization.id = :ownerOrganizationId
      AND dcpm.disabledForProfile.id = :customerProfileId
      AND dcpm.serviceProduct.id = :serviceProductId
""")
    DisabledCustomerProductMapping findAlreadyDisabledProduct(
            @Param("ownerProfileId") Long ownerProfileId,
            @Param("ownerOrganizationId") Long ownerOrganizationId,
            @Param("customerProfileId") Long customerProfileId,
            @Param("serviceProductId") Long serviceProductId);

    @Modifying
    @Query(
            """
    DELETE FROM DisabledCustomerProductMapping dcpm
    WHERE dcpm.ownerProfile.id = :ownerProfileId
      AND dcpm.organization.id = :ownerOrganizationId
      AND dcpm.disabledForProfile.id = :customerProfileId
      AND dcpm.serviceProduct.id = :serviceProductId
""")
    void deleteDisabledProduct(
            @Param("ownerProfileId") Long ownerProfileId,
            @Param("ownerOrganizationId") Long ownerOrganizationId,
            @Param("customerProfileId") Long customerProfileId,
            @Param("serviceProductId") Long serviceProductId);

    @Query(
            """
    SELECT dcpm.serviceProduct.id FROM DisabledCustomerProductMapping dcpm
      WHERE dcpm.ownerProfile.id = :ownerProfileId
      AND dcpm.organization.id = :ownerOrganizationId
      AND dcpm.disabledForProfile.id = :customerProfileId
    """)
    List<Long> findAllDisabledProductIds(
            @Param("ownerProfileId") Long ownerProfileId,
            @Param("ownerOrganizationId") Long ownerOrganizationId,
            @Param("customerProfileId") Long customerProfileId);
}
