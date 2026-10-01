package com.dentalstack.patient.feature.treatment.entity.production;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner_production_lab",
        indexes = {@Index(name = "UX_aligner_production_lab_name", columnList = "name")})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AlignerProductionLab extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private String name;

    private String logoUrl;

    @Nullable
    private Long addedByUserId;

    @Nullable
    @Enumerated(EnumType.STRING)
    private UserType addedByUserType;

    private Boolean isDefault;
}
