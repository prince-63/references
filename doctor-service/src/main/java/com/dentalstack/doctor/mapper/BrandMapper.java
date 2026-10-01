package com.dentalstack.doctor.mapper;

import com.dentalstack.doctor.dto.brand.DoctorAddBrandReq;
import com.dentalstack.doctor.entity.Brand;

/**
 * Mapper class responsible for creating {@link Brand} entities from DTOs.
 */
public final class BrandMapper {

    private BrandMapper() {
        // Utility class — no instantiation
    }

    public static Brand fromAddRequest(DoctorAddBrandReq doctorAddBrandReq) {
        return Brand.builder()
                .brandName(doctorAddBrandReq.getBrandName())
                .isCommon(false)
                .build();
    }
}
