package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductResponseDto;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class ServiceResponseDto {
    private Long id;
    private Long profileId;
    private Long orgId;
    private String subscriptionType;
    private List<String> serviceProducts;
    private Map<String, String> serviceProductLabel;
    private List<ServiceProductResponseDto> serviceProductsList;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
