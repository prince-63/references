package com.dentalstack.patient.feature.workflow.product.repository;

import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceProductRepository extends JpaRepository<ServiceProduct, Long> {

    @Query(
            """
    SELECT sp FROM ServiceProduct sp
    LEFT JOIN FETCH sp.productCategory
    WHERE sp.userProfile.id = :profileId
      AND (:productType IS NULL OR :productType = 'ALL' OR sp.productType = :productType)
    ORDER BY sp.createdAt DESC
    """)
    List<ServiceProduct> findByProfileIdAndProductType(
            @Param("profileId") Long profileId, @Param("productType") String productType);

    @Query(
            """
    SELECT sp FROM ServiceProduct sp
    LEFT JOIN FETCH sp.productCategory
    WHERE sp.userProfile.id = :profileId
      AND sp.isProductEnabled = true
    """)
    List<ServiceProduct> findByProfileId(@Param("profileId") Long profileId);

    @Query(
            "SELECT sp FROM ServiceProduct sp LEFT JOIN FETCH sp.productCategory WHERE sp.productCategory.id = :categoryId ORDER BY sp.createdAt DESC")
    List<ServiceProduct> findByProductCategoryId(@Param("categoryId") Long categoryId);

    @Query(
            "SELECT CASE WHEN COUNT(sp) > 0 THEN true ELSE false END FROM ServiceProduct sp WHERE sp.productName = :productName AND sp.userProfile.id = :profileId")
    boolean existsByProductNameAndProfileId(
            @Param("productName") String productName, @Param("profileId") Long profileId);

    @Query("SELECT sp FROM ServiceProduct sp " + "LEFT JOIN FETCH sp.userProfile "
            + "LEFT JOIN FETCH sp.productCategory "
            + "WHERE sp.id = :id")
    Optional<ServiceProduct> findByIdWithAssociations(@Param("id") Long id);

    @Query(
            """
            SELECT sp
            FROM ServiceProduct sp
            LEFT JOIN FETCH sp.userProfile up
            LEFT JOIN FETCH up.user
            LEFT JOIN FETCH up.organization org
            LEFT JOIN FETCH up.doctor doc
            LEFT JOIN FETCH up.doctorBilling db
            LEFT JOIN FETCH sp.productCategory
            WHERE (:productType IS NULL OR sp.productType = :productType)
              AND (:search IS NULL OR :search = '' OR LOWER(sp.productName) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:categoryId IS NULL OR sp.productCategory.id = :categoryId)
              AND (:categoryName IS NULL OR :categoryName = '' OR LOWER(sp.productCategory.name) LIKE LOWER(CONCAT('%', :categoryName, '%')))
              AND (:isProductEnabled IS NULL OR sp.isProductEnabled = :isProductEnabled)
              AND sp.userProfile.id = :ownerProfileId
            """)
    List<ServiceProduct> findAllByOwnerProfileId(
            @Param("search") String search,
            @Param("productType") String productType,
            @Param("categoryId") Long categoryId,
            @Param("categoryName") String categoryName,
            @Param("ownerProfileId") Long ownerProfileId,
            @Param("isProductEnabled") Boolean isProductEnabled);

    @Query(
            """
    SELECT sp
    FROM ServiceProduct sp
    LEFT JOIN FETCH sp.userProfile up
    LEFT JOIN FETCH up.doctorBilling db
    LEFT JOIN FETCH up.user
    LEFT JOIN FETCH up.organization org
    LEFT JOIN FETCH up.doctor doc
    LEFT JOIN FETCH sp.productCategory
    WHERE (:productType IS NULL OR sp.productType = :productType)
      AND (:search IS NULL OR :search = '' OR LOWER(sp.productName) LIKE LOWER(CONCAT('%', :search, '%')))
      AND (:categoryId IS NULL OR sp.productCategory.id = :categoryId)
      AND (:categoryName IS NULL OR :categoryName = '' OR LOWER(sp.productCategory.name) LIKE LOWER(CONCAT('%', :categoryName, '%')))
      AND (:isProductEnabled IS NULL OR sp.isProductEnabled = :isProductEnabled)
      AND sp.userProfile.id IN :vendorProfileIds
    """)
    List<ServiceProduct> findAllByVendorProfileId(
            @Param("search") String search,
            @Param("productType") String productType,
            @Param("categoryId") Long categoryId,
            @Param("categoryName") String categoryName,
            @Param("vendorProfileIds") List<Long> vendorProfileIds,
            @Param("isProductEnabled") Boolean isProductEnabled);

    @Query("SELECT COUNT(p) FROM ServiceProduct p WHERE p.userProfile.id = :profileId")
    Long countServiceProductByProfileId(@Param("profileId") Long profileId);

    @Query("SELECT COUNT(p) FROM ServiceProduct p WHERE p.userProfile.id = :profileId AND p.isProductEnabled = true")
    Long countEnabledServiceProductByProfileId(Long profileId);

    @Modifying
    @Query(
            """
        UPDATE ServiceProduct sp
        SET sp.isProductEnabled =
            CASE
                WHEN sp.isProductEnabled IS NULL THEN TRUE
                WHEN sp.isProductEnabled = TRUE THEN FALSE
                ELSE TRUE
            END
        WHERE sp.id = :productId
    """)
    void toggleProductStatus(@Param("productId") Long productId);

    @Query(
            """
    SELECT sp
    FROM ServiceProduct sp
    LEFT JOIN FETCH sp.productCategory pc
    LEFT JOIN FETCH sp.userProfile up
    LEFT JOIN FETCH up.doctorBilling db
    LEFT JOIN FETCH up.organization
    LEFT JOIN FETCH up.doctor
    LEFT JOIN FETCH up.user
    WHERE sp.id = :productId
""")
    ServiceProduct findServiceProductById(@Param("productId") Long productId);

    @Query(
            """
    SELECT DISTINCT sp
    FROM ServiceProduct sp
    LEFT JOIN FETCH sp.userProfile up
    LEFT JOIN FETCH up.doctorBilling db
    LEFT JOIN FETCH up.user
    LEFT JOIN FETCH up.organization
    LEFT JOIN FETCH sp.productCategory
    WHERE up.id = :ownerProfileId
      AND (:enabledProduct IS NULL OR sp.isProductEnabled = :enabledProduct)
      AND (:defaultProduct IS NULL OR sp.isDefault = :defaultProduct)
""")
    List<ServiceProduct> findAllByOwnerProfile(
            @Param("ownerProfileId") Long ownerProfileId,
            @Param("enabledProduct") Boolean enabledProduct,
            @Param("defaultProduct") Boolean defaultProduct);
}
