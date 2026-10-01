package com.dentalstack.doctor.mapper;

import com.dentalstack.doctor.entity.Brand;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.DoctorBrand;

/**
 * Mapper class responsible for creating {@link DoctorBrand} entities.
 */
public final class DoctorBrandMapper {

    private DoctorBrandMapper() {
        // Utility class — no instantiation
    }

    public static DoctorBrand fromDoctorAndBrand(Doctor doctor, Brand brand) {
        return DoctorBrand.builder()
                .doctor(doctor)
                .brand(brand)
                .isSelected(true)
                .build();
    }
}
