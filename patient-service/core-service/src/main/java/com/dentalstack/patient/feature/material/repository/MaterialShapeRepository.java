package com.dentalstack.patient.feature.material.repository;

import com.dentalstack.patient.feature.material.entity.MaterialShape;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialShapeRepository extends JpaRepository<MaterialShape, Long> {

    @Query("SELECT ms FROM MaterialShape ms LEFT JOIN FETCH ms.treatmentStage WHERE ms.treatmentStage.id = :stageId")
    List<MaterialShape> findByTreatmentStageId(@Param("stageId") Long stageId);
}
