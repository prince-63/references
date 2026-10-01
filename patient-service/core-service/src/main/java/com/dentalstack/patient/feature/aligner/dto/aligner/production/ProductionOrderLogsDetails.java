package com.dentalstack.patient.feature.aligner.dto.aligner.production;

import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionOrderLog;
import com.dentalstack.patient.feature.aligner.enums.aligner.production.ProductionStatus;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductionOrderLogsDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private ProductionOrderLogsDetails previousProductionOrderLog;

    private AlignerProductionLab alignerProductionLab;

    private ProductionStatus productionStatus;

    public static ProductionOrderLogsDetails from(AlignerProductionOrderLog alignerProductionOrderLog) {
        return null;
    }
}
