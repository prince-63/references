package com.dentalstack.patient.feature.material.repository;

import com.dentalstack.patient.feature.material.entity.MaterialSize;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialSizeRepository extends JpaRepository<MaterialSize, Long> {

    @Query(
            "SELECT ms FROM MaterialSize ms LEFT JOIN FETCH ms.material m LEFT JOIN FETCH m.shape s LEFT JOIN FETCH s.treatmentStage WHERE ms.doctorId = :doctorId AND ms.material.id = :materialId")
    List<MaterialSize> findByDoctorIdAndMaterialId(
            @Param("doctorId") Long doctorId, @Param("materialId") Long materialId);

    @Query(
            "SELECT ms FROM MaterialSize ms LEFT JOIN FETCH ms.material m LEFT JOIN FETCH m.shape s LEFT JOIN FETCH s.treatmentStage WHERE ms.isCommon = true AND ms.material.id = :materialId")
    List<MaterialSize> findByIsCommonTrueAndMaterialId(@Param("materialId") Long materialId);

    Optional<MaterialSize> findByNameAndIsCommonFalseAndDoctorIdAndMaterialId(
            String materialSize, long doctorId, long materialId);
}
