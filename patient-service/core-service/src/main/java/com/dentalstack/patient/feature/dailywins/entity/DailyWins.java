package com.dentalstack.patient.feature.dailywins.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.*;

@Entity(name = "daily_wins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyWins extends BaseEntity {
    private String code;
    private String title;
    private String description;
    private Integer points;
}
