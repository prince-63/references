package com.dentalstack.patient.feature.treatment.dto.production.lab;

import com.dentalstack.patient.feature.treatment.entity.production.AlignerProductionLab;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerProductionLabDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long labId;
    private String name;
    private String logoUrl;

    public static AlignerProductionLabDetails from(@NotNull AlignerProductionLab alignerProductionLab) {
        return new AlignerProductionLabDetails(
                alignerProductionLab.getId(), alignerProductionLab.getName(), alignerProductionLab.getLogoUrl());
    }
}
