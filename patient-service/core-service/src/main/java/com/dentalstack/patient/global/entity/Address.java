package com.dentalstack.patient.global.entity;

import com.dentalstack.patient.feature.patient.dto.AddressDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "address")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address extends BaseEntity {
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String country;
    private Integer pincode;
    private Boolean active;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    public static Address from(AddressDetails addressDetails, Patient patient) {
        return Address.builder()
                .line1(addressDetails.getLine1())
                .line2(addressDetails.getLine2())
                .city(addressDetails.getCity())
                .state(addressDetails.getState())
                .country(addressDetails.getCountry())
                .pincode(addressDetails.getPincode())
                .patient(patient)
                .active(true)
                .build();
    }

    public static Address newFrom(Patient patient) {
        return Address.builder().patient(patient).build();
    }

    public static List<Address> convertAddressLeadToAddressList(List<AddressLead> addressLeadList, Patient patient) {
        List<Address> addressList = new ArrayList<>();
        for (AddressLead addressLead : addressLeadList) {
            Address address = Address.from(
                    AddressDetails.builder()
                            .line1(addressLead.getLine1())
                            .line2(addressLead.getLine2())
                            .city(addressLead.getCity())
                            .state(addressLead.getState())
                            .country(addressLead.getCountry())
                            .pincode(addressLead.getPincode())
                            .build(),
                    patient);
            addressList.add(address);
        }
        return addressList;
    }
}
