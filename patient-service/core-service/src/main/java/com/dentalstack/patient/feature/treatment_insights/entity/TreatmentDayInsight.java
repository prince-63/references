package com.dentalstack.patient.feature.treatment_insights.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "treatment_day_insight")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentDayInsight extends BaseEntity {

    @Column(name = "day_number", nullable = false, unique = true)
    private Integer dayNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
}
