package com.dentalstack.patient.feature.producttype.repository;

import com.dentalstack.patient.feature.producttype.entity.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByPatientId(Long patientId);
}
