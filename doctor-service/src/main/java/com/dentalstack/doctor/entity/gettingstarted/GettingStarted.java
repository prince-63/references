package com.dentalstack.doctor.entity.gettingstarted;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.gettingstarted.GettingStartedEnum;
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
