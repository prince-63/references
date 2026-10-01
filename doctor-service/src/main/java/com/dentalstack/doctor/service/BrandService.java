package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.brand.AddBrandRequest;
import com.dentalstack.doctor.dto.brand.DoctorAddBrandReq;
import com.dentalstack.doctor.dto.brand.DoctorBrandDetails;
import java.util.List;

public interface BrandService {

    String addBrand(AddBrandRequest addBrandRequest);

    String addIndividualBrand(DoctorAddBrandReq doctorAddBrandReq);

    List<DoctorBrandDetails> getDoctorSelectedBrand(Long doctorId);

    List<DoctorBrandDetails> getCommonPlusDoctorBrands(Long doctorId);

    void selectBrands(List<Long> selectedBrandIds, Long doctorId);
}
