package com.dentalstack.doctor.entity.billing;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.user.ProfileImage;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.fasterxml.jackson.annotation.JsonBackReference;
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "company_image_id")
    @ToString.Exclude
    private ProfileImage companyImage;

    private String companyDisplayName;

    private String companyBrandName;

    private String companyBrandProfilePicture;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "company_brand_profile_image_id")
    @ToString.Exclude
    private ProfileImage companyBrandProfileImage;

    @OneToOne(mappedBy = "doctorBilling", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonBackReference("profile-billing")
    private UserProfile userProfile;
}
