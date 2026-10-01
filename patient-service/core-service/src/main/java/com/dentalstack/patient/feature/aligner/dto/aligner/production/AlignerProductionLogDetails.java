package com.dentalstack.patient.feature.aligner.dto.aligner.production;

import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLog;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.production.ProductionStatus;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerProductionLogDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int srNo;
    private String oldAlignerProductionLab;
    private String newAlignerProductionLab;

    private ProductionSubStatus oldProductionSubStatus;
    private ProductionSubStatus newProductionSubStatus;

    private ProductionStatus oldProductionStatus;
    private ProductionStatus newProductionStatus;

    private ZonedDateTime loggedAt;

    public static AlignerProductionLogDetails from(AlignerProductionLog alignerProductionLog) {
        return new AlignerProductionLogDetails(
                alignerProductionLog.getSrNo(),
                alignerProductionLog.getOldAlignerProductionLab(),
                alignerProductionLog.getNewAlignerProductionLab(),
                alignerProductionLog.getOldProductionSubStatus(),
                alignerProductionLog.getNewProductionSubStatus(),
                alignerProductionLog.getOldProductionStatus(),
                alignerProductionLog.getNewProductionStatus(),
                alignerProductionLog.getCreatedAt());
    }
}
