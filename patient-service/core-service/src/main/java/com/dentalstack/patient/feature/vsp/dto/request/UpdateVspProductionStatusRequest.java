package com.dentalstack.patient.feature.vsp.dto.request;

import com.dentalstack.patient.feature.vsp.enums.VspProductionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateVspProductionStatusRequest {

    @NotNull
    private String productionId;

    @NotNull
    private VspProductionStatus status;
}
