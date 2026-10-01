package com.dentalstack.patient.feature.billing.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctor_billing")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorBilling extends BaseEntity {

    private String companyLegalName;

    private String addressLine1;

    private String addressLine2;

    private String country;

    private String state;

    private String city;

    private String pincode;

    private String companyTaxId;

    private String currency;

    private String companyImageUrl;

    private String companyDisplayName;

    private String companyBrandName;

    @OneToOne(mappedBy = "doctorBilling", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private UserProfile userProfile;
}
