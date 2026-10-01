package com.dentalstack.patient.feature.vsp.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class CreateVspProductionRequest {

    private Long profileId;

    @NotNull
    private String vspOrderId;

    private int intermediateSplintQty;
    private int finalSplintQty;
    private int dentalArchesUpperQty;
    private int dentalArchesLowerQty;
    private int othersCustomQty;

    private String productionNotes;

    private List<Long> stlFileIds;
}
