package com.dentalstack.patient.feature.bracket.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "braces_bracket_sub_type")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class BracketSubType extends BaseEntity {

    private String bracketSubTypeName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bracket_type_id")
    private BracketType bracketType;
}
