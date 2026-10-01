package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.entity.VspShippingDetails;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VspShippingDetailsResponse {

    private String shippingId;
    private String addressedTo;
    private String name;
    private String addressLine;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String mobileNumber;
    private boolean isDefault;
    private Long profileId;
    private Long customerProfileId;
    private ZonedDateTime createdAt;

    public static VspShippingDetailsResponse from(VspShippingDetails shippingDetails) {
        if (shippingDetails == null) {
            return null;
        }
        return VspShippingDetailsResponse.builder()
                .shippingId(shippingDetails.getId())
                .addressedTo(shippingDetails.getAddressedTo())
                .name(shippingDetails.getName())
                .addressLine(shippingDetails.getAddressLine())
                .city(shippingDetails.getCity())
                .state(shippingDetails.getState())
                .country(shippingDetails.getCountry())
                .pincode(shippingDetails.getPincode())
                .mobileNumber(shippingDetails.getMobileNumber())
                .isDefault(shippingDetails.isDefault())
                .profileId(shippingDetails.getProfileId())
                .customerProfileId(shippingDetails.getCustomerProfileId())
                .createdAt(shippingDetails.getCreatedAt())
                .build();
    }
}
