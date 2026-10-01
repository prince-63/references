package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.Brand;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByIsCommonTrue();

    boolean existsByBrandNameIgnoreCase(String brandName);
}
