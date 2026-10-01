package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ManufacturingDetails {
    private ManufacturingStatus status;
    private LocalDate startedOn;
    private Long id;
    private LocalDate completedOn;
    private LocalDate shippedOn;
    private BatchType batchType;
    private Integer totalAligners;
    private Integer upperAlignerStart;
    private Integer upperAlignerEnd;
    private Integer lowerAlignerStart;
    private Integer lowerAlignerEnd;
    private String trackingNumber;
    private String trackingLink;
    private LocalDate deliveredOn;
    private String notes;
    private LocalDate dueDate;

    public static ManufacturingDetails from(ManufacturingBatch batch) {
        return ManufacturingDetails.builder()
                .id(batch.getId())
                .status(batch.getStatus())
                .startedOn(batch.getStartDate() != null ? batch.getStartDate() : null)
                .completedOn(batch.getCompletionDate() != null ? batch.getCompletionDate() : null)
                .shippedOn(batch.getShippingDate() != null ? batch.getShippingDate() : null)
                .deliveredOn(batch.getDeliveryDate() != null ? batch.getDeliveryDate() : null)
                .batchType(batch.getBatchType())
                .totalAligners(batch.getTotalAligners())
                .upperAlignerStart(batch.getUpperAlignerStart())
                .upperAlignerEnd(batch.getUpperAlignerEnd())
                .lowerAlignerStart(batch.getLowerAlignerStart())
                .lowerAlignerEnd(batch.getLowerAlignerEnd())
                .trackingNumber(batch.getTrackingNumber())
                .trackingLink(batch.getTrackingLink())
                .build();
    }
}
