package com.dentalstack.patient.feature.rewards.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductConfigListResponse {
    private List<ProductConfigResponse> products;
    private Integer totalCount;
}
