package com.dentalstack.patient.feature.material.repository;

import com.dentalstack.patient.feature.material.entity.Material;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    @Query(
            "SELECT m FROM Material m LEFT JOIN FETCH m.shape ms LEFT JOIN FETCH ms.treatmentStage WHERE m.isCommon = true AND m.shape.id = :shapeId")
    List<Material> findByIsCommonTrueAndShapeId(@Param("shapeId") Long shapeId);

    @Query(
            "SELECT m FROM Material m LEFT JOIN FETCH m.shape ms LEFT JOIN FETCH ms.treatmentStage WHERE m.doctorId = :doctorId AND m.shape.id = :shapeId")
    List<Material> findByDoctorIdAndShapeId(@Param("doctorId") Long doctorId, @Param("shapeId") Long shapeId);

    Optional<Material> findByNameAndShapeIdAndIsCommonFalseAndDoctorId(String name, Long shapeId, Long doctorId);
}
