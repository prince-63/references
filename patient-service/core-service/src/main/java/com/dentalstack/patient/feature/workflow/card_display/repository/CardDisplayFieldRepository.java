package com.dentalstack.patient.feature.workflow.card_display.repository;

import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayField;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardDisplayFieldRepository extends JpaRepository<CardDisplayField, Long> {

    List<CardDisplayField> findByConfig_IdOrderByPosition(Long configId);

    List<CardDisplayField> findByConfig_IdOrderByPositionAsc(Long configId);

    List<CardDisplayField> findByConfig_IdAndEnabledTrueOrderByPosition(Long configId);
}
