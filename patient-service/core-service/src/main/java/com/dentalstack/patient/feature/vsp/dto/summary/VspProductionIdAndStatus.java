package com.dentalstack.patient.feature.vsp.dto.summary;

import com.dentalstack.patient.feature.vsp.enums.VspProductionStatus;

public interface VspProductionIdAndStatus {
    String getId();

    VspProductionStatus getStatus();
}
