package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateManufacturingRequest {
    private ManufacturingStatus status;
    private Long manufacturingId;
    private LocalDate shippingDate;
    private LocalDate tentativeDeliveryDate;
    private String trackingNumber;
    private String trackingLink;
    private LocalDate deliveryDate;
    private LocalDate completionDate;
    private String notes;
    private Boolean isCurrent;
    private Long patientId;
    private Long profileId;
    private Long doctorId;
    private Integer upperAlignerStart;

    private Integer upperAlignerEnd;

    private Integer lowerAlignerStart;

    private Integer lowerAlignerEnd;

    private Integer totalAligners;

    private LocalDate startDate;
    private Boolean isShowMarkAsReceived;
    private Boolean isAlignersUpdated;
    private BatchType batchType;
    private String instructions;
}
