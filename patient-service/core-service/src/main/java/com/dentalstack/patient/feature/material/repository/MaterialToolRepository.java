package com.dentalstack.patient.feature.material.repository;

import com.dentalstack.patient.feature.material.entity.MaterialTool;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialToolRepository extends JpaRepository<MaterialTool, Long> {
    List<MaterialTool> findByDoctorId(Long doctorId);

    List<MaterialTool> findByIsCommonTrue();
}
