package com.dentalstack.patient.feature.workflow.product.repository;

import com.dentalstack.patient.feature.workflow.product.entity.CustomerAdminProductMapping;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerAdminProductMappingRepository extends JpaRepository<CustomerAdminProductMapping, Long> {

    @Modifying
    @Query(
            """
        DELETE FROM CustomerAdminProductMapping m
        WHERE m.assignee.id = :assigneeId
          AND m.userProfile.id = :ownerId
          AND m.serviceProduct.id = :productId
    """)
    void deleteByAssigneeIdAndOwnerIdAndProductId(
            @Param("assigneeId") Long assigneeId, @Param("ownerId") Long ownerId, @Param("productId") Long productId);

    @Query("SELECT DISTINCT sp " + "FROM CustomerAdminProductMapping m "
            + "JOIN m.serviceProduct sp "
            + "LEFT JOIN FETCH sp.userProfile up "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.user u "
            + "LEFT JOIN FETCH sp.productCategory pc "
            + "WHERE (:productType IS NULL OR sp.productType = :productType) "
            + "  AND (:search IS NULL OR :search = '' OR LOWER(sp.productName) LIKE LOWER(CONCAT('%', :search, '%'))) "
            + "  AND (:categoryId IS NULL OR pc.id = :categoryId) "
            + "  AND (:categoryName IS NULL OR :categoryName = '' OR LOWER(pc.name) LIKE LOWER(CONCAT('%', :categoryName, '%'))) "
            + "  AND (m.assignee.id = :profileId OR m.userProfile.id = :profileId) "
            + "  AND sp.isProductEnabled = true")
    List<ServiceProduct> findAllProductsByCustomerProfileId(
            @Param("search") String search,
            @Param("productType") String productType,
            @Param("categoryId") Long categoryId,
            @Param("categoryName") String categoryName,
            @Param("profileId") Long profileId);

    @Query(
            "SELECT DISTINCT COUNT(m) FROM CustomerAdminProductMapping m WHERE m.assignee.id = :assigneeProfileId AND m.userProfile.id = :ownerProfileId")
    Long countEnabledServiceProductByOwnerAndCustomer(
            @Param("assigneeProfileId") Long assigneeProfileId, @Param("ownerProfileId") Long ownerProfileId);
}
