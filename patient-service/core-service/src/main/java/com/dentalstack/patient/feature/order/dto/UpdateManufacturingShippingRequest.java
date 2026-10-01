package com.dentalstack.patient.feature.order.dto;

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
public class UpdateManufacturingShippingRequest {
    private ManufacturingStatus status;
    private LocalDate shippingDate;
    private Long manufacturingId;

    private LocalDate tentativeDeliveryDate;

    private String trackingNumber;
    private String trackingLink;

    private Long patientId;
    private Long doctorId;
    private Long profileId;
    private LocalDate shippingAddedOn;
}
