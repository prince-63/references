package com.dentalstack.patient.global.entity;

import com.dentalstack.patient.feature.patient.dto.AddressDetails;
import com.dentalstack.patient.feature.patient.entity.PatientLead;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "address_lead")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressLead extends BaseEntity {
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String country;
    private Integer pincode;
    private Boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_lead_id")
    @ToString.Exclude
    private PatientLead patientLead;

    public static AddressLead from(AddressDetails addressDetails, PatientLead patient) {
        return AddressLead.builder()
                .line1(addressDetails.getLine1())
                .line2(addressDetails.getLine2())
                .city(addressDetails.getCity())
                .state(addressDetails.getState())
                .country(addressDetails.getCountry())
                .pincode(addressDetails.getPincode())
                .patientLead(patient)
                .active(true)
                .build();
    }

    public static AddressLead newFrom(PatientLead patient) {
        return AddressLead.builder().patientLead(patient).build();
    }
}
