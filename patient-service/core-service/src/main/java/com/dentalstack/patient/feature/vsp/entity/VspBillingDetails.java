package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.global.entity.NewBaseEntity;
import com.dentalstack.patient.global.utils.AddressFormatUtil;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vsp_billing_details")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspBillingDetails extends NewBaseEntity {

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
}
