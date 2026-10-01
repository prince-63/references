package com.dentalstack.patient.feature.material.repository;

import com.dentalstack.patient.feature.material.entity.MaterialTreatmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialTreatmentStageRepository extends JpaRepository<MaterialTreatmentStage, Long> {}
