package com.dentalstack.doctor.dto.billing;

import com.dentalstack.doctor.entity.billing.DoctorBilling;
import com.dentalstack.doctor.enums.organization.ProfileType;
import com.dentalstack.doctor.summary.DoctorBillingSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorBillingDetails {

    private long billingId;
    private long doctorId;
    private long organizationId;
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
    private Long companyImageId;
    private String companyDisplayName;
    private String companyBrandName;
    private String companyBrandProfilePicture;
    private Long companyBrandProfilePictureId;
    private String planName;
    private ProfileType profileType;

    public static DoctorBillingDetails from(DoctorBilling doctorBilling) {
        if (doctorBilling == null) {
            return null;
        }
        return DoctorBillingDetails.builder()
                .billingId(doctorBilling.getId())
                .doctorId(doctorBilling.getUserProfile().getDoctor().getId())
                .organizationId(doctorBilling.getUserProfile().getOrganization().getId())
                .companyLegalName(doctorBilling.getCompanyLegalName())
                .addressLine1(doctorBilling.getAddressLine1())
                .addressLine2(doctorBilling.getAddressLine2())
                .country(doctorBilling.getCountry())
                .state(doctorBilling.getState())
                .city(doctorBilling.getCity())
                .pincode(doctorBilling.getPincode())
                .companyTaxId(doctorBilling.getCompanyTaxId())
                .currency(doctorBilling.getCurrency())
                .companyImageUrl(doctorBilling.getCompanyImageUrl())
                .companyImageId(
                        doctorBilling.getCompanyImage() != null
                                ? doctorBilling.getCompanyImage().getId()
                                : null)
                .companyDisplayName(
                        doctorBilling.getCompanyDisplayName() != null ? doctorBilling.getCompanyDisplayName() : null)
                .companyBrandName(doctorBilling.getCompanyBrandName())
                .companyBrandProfilePicture(doctorBilling.getCompanyBrandProfilePicture())
                .companyBrandProfilePictureId(
                        doctorBilling.getCompanyBrandProfileImage() != null
                                ? doctorBilling.getCompanyBrandProfileImage().getId()
                                : null)
                .build();
    }

    public static DoctorBillingDetails convertToDetails(DoctorBillingSummary summary) {
        return DoctorBillingDetails.builder()
                .billingId(summary.getBillingId())
                .doctorId(summary.getDoctorId())
                .organizationId(summary.getOrganizationId())
                .companyLegalName(summary.getCompanyLegalName())
                .addressLine1(summary.getAddressLine1())
                .addressLine2(summary.getAddressLine2())
                .country(summary.getCountry())
                .state(summary.getState())
                .city(summary.getCity())
                .pincode(summary.getPincode())
                .companyTaxId(summary.getCompanyTaxId())
                .currency(summary.getCurrency())
                .companyImageUrl(summary.getCompanyImageUrl())
                .companyDisplayName(summary.getCompanyDisplayName())
                .companyBrandName(summary.getCompanyBrandName())
                .companyBrandProfilePicture(summary.getCompanyBrandProfilePicture())
                .companyBrandProfilePictureId(summary.getCompanyBrandProfileImageId())
                .companyImageId(summary.getCompanyImageId())
                .planName(summary.getPlanName())
                .profileType(summary.getProfileType() != null ? ProfileType.valueOf(summary.getProfileType()) : null)
                .build();
    }
}
