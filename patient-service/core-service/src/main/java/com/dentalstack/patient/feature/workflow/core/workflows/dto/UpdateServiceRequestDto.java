package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class UpdateServiceRequestDto {
    private String subscriptionType;
    private List<String> serviceProducts;
    private Map<String, String> serviceProductLabel;
}
