package com.dentalstack.patient.feature.order.dto.v2;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MinimumOrderDetailResponse {
    private List<String> orderIds;
    private Long patientId;
}
