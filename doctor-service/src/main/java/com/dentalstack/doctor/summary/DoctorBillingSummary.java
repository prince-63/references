package com.dentalstack.doctor.summary;

public interface DoctorBillingSummary {
    Long getBillingId();

    Long getDoctorId();

    Long getOrganizationId();

    String getCompanyLegalName();

    String getAddressLine1();

    String getAddressLine2();

    String getCountry();

    String getState();

    String getCity();

    String getPincode();

    String getCompanyTaxId();

    String getCurrency();

    String getCompanyImageUrl();

    Long getCompanyImageId();

    String getCompanyDisplayName();

    String getCompanyBrandName();

    String getCompanyBrandProfilePicture();

    Long getCompanyBrandProfileImageId();

    String getProfileType();

    String getPlanName();
}
