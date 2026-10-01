package com.dentalstack.patient.feature.vsp.dto.summary;

import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;

public interface VspOrderIdAndStatus {
    String getId();

    VspOrderStatus getStatus();
}
