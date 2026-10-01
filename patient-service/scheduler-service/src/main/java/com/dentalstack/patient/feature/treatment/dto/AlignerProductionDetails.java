package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.dto.production.AlignerProductionLogDetails;
import com.dentalstack.patient.feature.treatment.dto.production.lab.AlignerProductionLabDetails;
import com.dentalstack.patient.feature.treatment.entity.production.AlignerProduction;
import com.dentalstack.patient.feature.treatment.entity.production.AlignerProductionLog;
import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.treatment.enums.production.ProductionStatus;
import jakarta.annotation.Nullable;
import java.io.Serial;
import java.io.Serializable;
import java.util.Comparator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerProductionDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AlignerProductionLabDetails productionLab;

    private ProductionStatus status;
    private ProductionSubStatus subStatus;

    @Nullable
    private AlignerProductionLogDetails lastStatusUpdate;

    public static AlignerProductionDetails from(AlignerProduction alignerProduction) {
        var productionLab = alignerProduction.getAlignerProductionLab();
        var lastStatusUpdateLog = alignerProduction.getLogs().stream()
                .sorted(Comparator.comparing(AlignerProductionLog::getCreatedAt).reversed())
                .filter(log -> log.getNewProductionSubStatus() != null
                        && log.getOldProductionSubStatus() != null
                        && !log.getOldProductionSubStatus().equals(log.getNewProductionSubStatus()))
                .findFirst()
                .orElse(null);

        return new AlignerProductionDetails(
                productionLab != null
                        ? AlignerProductionLabDetails.from(alignerProduction.getAlignerProductionLab())
                        : null,
                alignerProduction.getStatus(),
                alignerProduction.getSubStatus(),
                lastStatusUpdateLog != null ? AlignerProductionLogDetails.from(lastStatusUpdateLog) : null);
    }
}
