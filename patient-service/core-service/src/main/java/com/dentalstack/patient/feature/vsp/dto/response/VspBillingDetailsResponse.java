package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.entity.VspBillingDetails;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VspBillingDetailsResponse {

    private String billingId;
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

    public static VspBillingDetailsResponse from(VspBillingDetails billingDetails) {
        if (billingDetails == null) {
            return null;
        }
        return VspBillingDetailsResponse.builder()
                .billingId(billingDetails.getId())
                .addressedTo(billingDetails.getAddressedTo())
                .name(billingDetails.getName())
                .addressLine(billingDetails.getAddressLine())
                .city(billingDetails.getCity())
                .state(billingDetails.getState())
                .country(billingDetails.getCountry())
                .pincode(billingDetails.getPincode())
                .mobileNumber(billingDetails.getMobileNumber())
                .isDefault(billingDetails.isDefault())
                .profileId(billingDetails.getProfileId())
                .customerProfileId(billingDetails.getCustomerProfileId())
                .createdAt(billingDetails.getCreatedAt())
                .build();
    }
}
