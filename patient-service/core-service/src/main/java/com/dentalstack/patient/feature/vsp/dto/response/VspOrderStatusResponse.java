package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VspOrderStatusResponse {
    private VspOrderStatus orderStatus;
}
