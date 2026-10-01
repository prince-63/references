package com.dentalstack.patient.feature.gettingstarted.entity;

import com.dentalstack.patient.feature.gettingstarted.enums.GettingStartedEnum;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "getting_started")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GettingStarted extends BaseEntity {
    private Long profileId;
    private Long organizationId;
    private Long doctorId;

    @Enumerated(EnumType.STRING)
    private GettingStartedEnum gettingStartedEnum;

    private Boolean isEnabled;
}
