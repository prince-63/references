package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ServiceProductResponseDto {
    private Long id;
    private Long serviceId;
    private String productType;
    private String productName;
    private String category;
    private String productDescription;
    private String productImage;
    private String productTag;
    private WorkFlowManagementMetadata productMetadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
