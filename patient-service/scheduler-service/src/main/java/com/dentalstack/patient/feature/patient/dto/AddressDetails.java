package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.user.entity.Address;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddressDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long addressId;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String country;
    private Integer pincode;
    private Boolean active;

    public static AddressDetails from(Address address) {
        return new AddressDetails(
                address.getId(),
                address.getLine1(),
                address.getLine2(),
                address.getCity(),
                address.getState(),
                address.getCountry(),
                address.getPincode(),
                address.getActive());
    }
}
