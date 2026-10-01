package com.dentalstack.patient.feature.workflow.product.repository;

import com.dentalstack.patient.feature.workflow.product.entity.ProductCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    @Query("SELECT CASE WHEN COUNT(pc) > 0 THEN true ELSE false END FROM ProductCategory pc WHERE pc.name = :name")
    boolean existsByNameAndProfileId(@Param("name") String name);

    @Query(
            value = "SELECT DISTINCT pc.* FROM product_category pc "
                    + "WHERE pc.role_names && CAST(:roleNames AS text[])",
            nativeQuery = true)
    List<ProductCategory> findByRoleNamesContaining(@Param("roleNames") String[] roleNames);

    @Query("SELECT pc FROM ProductCategory pc WHERE pc.isDefault = true AND pc.name = :name")
    ProductCategory findByName(@Param("name") String name);
}
