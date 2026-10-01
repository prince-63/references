package com.dentalstack.patient.feature.treatment_insights.repository;

import com.dentalstack.patient.feature.treatment_insights.entity.TreatmentDayInsight;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TreatmentDayInsightRepository extends JpaRepository<TreatmentDayInsight, Long> {

    List<TreatmentDayInsight> findByDayNumberBetweenOrderByDayNumberAsc(Integer start, Integer end);
}
