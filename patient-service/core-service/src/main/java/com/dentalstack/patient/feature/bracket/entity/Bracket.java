package com.dentalstack.patient.feature.bracket.entity;

import com.dentalstack.patient.feature.bracket.enums.BracketNameEnum;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "braces_bracket")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class Bracket extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private BracketNameEnum materialStageType;
}
