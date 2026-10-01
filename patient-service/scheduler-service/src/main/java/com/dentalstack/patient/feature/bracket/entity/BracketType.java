package com.dentalstack.patient.feature.bracket.entity;

import com.dentalstack.patient.feature.bracket.enums.BracketTypeEnum;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "braces_bracket_type")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class BracketType extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private BracketTypeEnum bracketTypeEnum;

    @ManyToOne
    @JoinColumn(name = "bracket_id")
    private Bracket bracket;
}
