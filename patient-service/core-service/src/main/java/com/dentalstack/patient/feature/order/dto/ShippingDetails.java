package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.utils.AddressFormatUtil;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipping_details")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingDetails extends BaseEntity {

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

    public String getFormattedAddress() {
        return AddressFormatUtil.formatAddress(addressedTo, name, addressLine, city, state, country, pincode);
    }

    public static ShippingDetails shippingDetails(ShippingDetailsRequest request) {
        return ShippingDetails.builder()
                .addressedTo(request.getAddressedTo())
                .name(request.getName())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .pincode(request.getPincode())
                .mobileNumber(request.getMobileNumber())
                .isDefault(request.isDefault())
                .profileId(request.getProfileId())
                .customerProfileId(request.getCustomerProfileId())
                .build();
    }

    public static ShippingDetails updateShippingDetails(
            ShippingDetailsRequest request, ShippingDetails existingShippingDetails) {
        return ShippingDetails.builder()
                .addressedTo(
                        request.getAddressedTo() != null
                                ? request.getAddressedTo()
                                : existingShippingDetails.getAddressedTo())
                .name(request.getName() != null ? request.getName() : existingShippingDetails.getName())
                .addressLine(
                        request.getAddressLine() != null
                                ? request.getAddressLine()
                                : existingShippingDetails.getAddressLine())
                .city(request.getCity() != null ? request.getCity() : existingShippingDetails.getCity())
                .state(request.getState() != null ? request.getState() : existingShippingDetails.getState())
                .country(request.getCountry() != null ? request.getCountry() : existingShippingDetails.getCountry())
                .pincode(request.getPincode() != null ? request.getPincode() : existingShippingDetails.getPincode())
                .mobileNumber(
                        request.getMobileNumber() != null
                                ? request.getMobileNumber()
                                : existingShippingDetails.getMobileNumber())
                .isDefault(request.isDefault())
                .customerProfileId(
                        request.getCustomerProfileId() != null
                                ? request.getCustomerProfileId()
                                : existingShippingDetails.getCustomerProfileId())
                .build();
    }
}
