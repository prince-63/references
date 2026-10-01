package com.dentalstack.patient.feature.production.dto.production;

import com.dentalstack.patient.feature.aligner.enums.aligner.production.ProductionStatus;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerProductionOrderRequest {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    Set<ProductionStatus> statuses;
}
