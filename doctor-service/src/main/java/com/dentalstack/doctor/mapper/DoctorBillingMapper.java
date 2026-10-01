package com.dentalstack.doctor.mapper;

import com.dentalstack.doctor.dto.billing.DoctorBillingRequest;
import com.dentalstack.doctor.entity.billing.DoctorBilling;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * Mapper class responsible for creating and updating {@link DoctorBilling} entities
 * from various DTOs.
 */
public final class DoctorBillingMapper {

    private DoctorBillingMapper() {
        // Utility class — no instantiation
    }

    public static DoctorBilling fromRequest(DoctorBillingRequest request) {
        return DoctorBilling.builder()
                .companyLegalName(request.getCompanyLegalName())
                .companyDisplayName(request.getCompanyDisplayName())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .country(request.getCountry())
                .state(request.getState())
                .city(request.getCity())
                .pincode(request.getPincode())
                .companyTaxId(request.getCompanyTaxId())
                .currency(request.getCurrency())
                .build();
    }

    public static void updateFromRequest(DoctorBilling doctorBilling, DoctorBillingRequest request) {
        updateIfPresent(request::getCompanyLegalName, doctorBilling::setCompanyLegalName);
        updateIfPresent(request::getCompanyDisplayName, doctorBilling::setCompanyDisplayName);
        updateIfPresent(request::getAddressLine1, doctorBilling::setAddressLine1);
        updateIfPresent(request::getAddressLine2, doctorBilling::setAddressLine2);
        updateIfPresent(request::getCountry, doctorBilling::setCountry);
        updateIfPresent(request::getState, doctorBilling::setState);
        updateIfPresent(request::getCity, doctorBilling::setCity);
        updateIfPresent(request::getPincode, doctorBilling::setPincode);
        updateIfPresent(request::getCompanyTaxId, doctorBilling::setCompanyTaxId);
        updateIfPresent(request::getCompanyBrandName, doctorBilling::setCompanyBrandName);
        updateIfPresent(request::getCurrency, doctorBilling::setCurrency);
    }

    private static <T> void updateIfPresent(Supplier<T> getter, Consumer<T> setter) {
        Optional.ofNullable(getter.get()).ifPresent(setter);
    }
}
