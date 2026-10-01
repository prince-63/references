package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerProductionLabRepository extends JpaRepository<AlignerProductionLab, Long> {
    Optional<AlignerProductionLab> findByName(String name);

    Optional<AlignerProductionLab> findByNameAndAddedByUserId(String name, long userId);

    List<AlignerProductionLab> findByAddedByUserIdAndIsDefault(long userId, boolean isDefault);
}
