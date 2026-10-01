package com.dentalstack.patient.feature.vsp.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class UpdateVspProductionRequest {

    @NotNull
    private String productionId;

    private Integer intermediateSplintQty;
    private Integer finalSplintQty;
    private Integer dentalArchesUpperQty;
    private Integer dentalArchesLowerQty;
    private Integer othersCustomQty;

    private String productionNotes;

    private List<Long> stlFileIds;
}
