package com.dentalstack.patient.feature.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateShippingDetailsRequest {
    @NotNull(message = "Profile ID is required")
    private Long profileId;

    private String addressedTo;

    private String name;

    private String addressLine;

    private String city;

    private String state;

    private String country;

    private String pincode;

    private String mobileNumber;

    @Builder.Default
    private boolean isDefault = false;

    private Long customerProfileId;
}
