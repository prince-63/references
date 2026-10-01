package com.dentalstack.patient.feature.vsp.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class AddVspProductionShippingRequest {

    @NotNull
    private String productionId;

    private String trackingNumber;
    private LocalDate tentativeDate;
    private String trackingLink;
    private LocalDate shippingDate;
}
