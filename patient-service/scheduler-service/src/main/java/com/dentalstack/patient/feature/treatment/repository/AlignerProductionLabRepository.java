package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.treatment.entity.production.AlignerProductionLab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerProductionLabRepository extends JpaRepository<AlignerProductionLab, Long> {}
