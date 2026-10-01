package com.dentalstack.patient.feature.rewards.dto.request;

import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlaceOrderRequest {
    @NotNull
    private OrderItemRequest item;

    private String phoneNumber;

    @Size(max = 500, message = "Delivery notes cannot exceed 500 characters")
    private String deliveryNotes;

    private OrderMetadataRequest metadata;

    @NotNull
    private Long patientId;
}
