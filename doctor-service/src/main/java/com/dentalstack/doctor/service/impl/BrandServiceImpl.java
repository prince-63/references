package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.dto.brand.AddBrandRequest;
import com.dentalstack.doctor.dto.brand.DoctorAddBrandReq;
import com.dentalstack.doctor.dto.brand.DoctorBrandDetails;
import com.dentalstack.doctor.entity.Brand;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.DoctorBrand;
import com.dentalstack.doctor.exception.doctor.ErrorCode;
import com.dentalstack.doctor.exception.doctor.InvalidRequestException;
import com.dentalstack.doctor.mapper.BrandMapper;
import com.dentalstack.doctor.mapper.DoctorBrandMapper;
import com.dentalstack.doctor.repository.BrandRepository;
import com.dentalstack.doctor.repository.DoctorBrandRepository;
import com.dentalstack.doctor.repository.DoctorRepository;
import com.dentalstack.doctor.service.BrandService;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final DoctorBrandRepository doctorBrandRepository;
    private final DoctorRepository doctorRepository;

    @Autowired
    private Environment environment;

    @Override
    public String addBrand(AddBrandRequest addBrandRequest) {
        // Check if the brand already exists (case-insensitive)
        if (brandRepository.existsByBrandNameIgnoreCase(addBrandRequest.getBrandName())) {
            return "Brand already exists";
        }

        // If not, proceed to add the brand
        Brand brand = new Brand();
        brand.setBrandName(addBrandRequest.getBrandName());
        brand.setCommon(true);
        brandRepository.save(brand);

        return "Brand added successfully";
    }

    @Override
    public String addIndividualBrand(DoctorAddBrandReq doctorAddBrandReq) {
        Doctor doctor = doctorRepository
                .findByIdAndActiveTrue(doctorAddBrandReq.getDoctorId())
                .orElseThrow(() -> new InvalidRequestException(
                        ErrorCode.BAD_REQUEST, "Doctor not found with" + doctorAddBrandReq.getDoctorId() + " this id"));
        // Check if the brand already exists (case-insensitive)
        if (brandRepository.existsByBrandNameIgnoreCase(doctorAddBrandReq.getBrandName())) {
            return "Brand already exists";
        }
        // If not, proceed to add the brand
        Brand brand = brandRepository.save(BrandMapper.fromAddRequest(doctorAddBrandReq));
        doctorBrandRepository.save(DoctorBrandMapper.fromDoctorAndBrand(doctor, brand));
        return "True";
    }

    @Override
    public List<DoctorBrandDetails> getDoctorSelectedBrand(Long doctorId) {

        Doctor doctor = doctorRepository
                .findByIdAndActiveTrue(doctorId)
                .orElseThrow(() -> new InvalidRequestException(
                        ErrorCode.BAD_REQUEST, "Doctor not found with" + doctorId + " this id"));

        List<DoctorBrand> individualBrandList = doctorBrandRepository.findByDoctorIdAndIsSelectedTrue(doctorId);

        // Sort the list alphabetically by brand name
        individualBrandList.sort(Comparator.comparing(db -> db.getBrand().getBrandName()));

        return getDoctorBrandDetails(individualBrandList);
    }

    @NotNull
    private static List<DoctorBrandDetails> getDoctorBrandDetails(List<DoctorBrand> individualBrandList) {
        List<DoctorBrandDetails> doctorBrandDetailsList = new ArrayList<>();

        // Process individual brands
        for (DoctorBrand individualBrand : individualBrandList) {
            Brand brand = individualBrand.getBrand(); // Get the individual brand associated with the doctor
            DoctorBrandDetails individualBrandDetails = new DoctorBrandDetails();
            individualBrandDetails.setBrandName(brand.getBrandName());
            individualBrandDetails.setBrandId(brand.getId()); // Set the individual brand's ID
            doctorBrandDetailsList.add(individualBrandDetails);
        }
        return doctorBrandDetailsList;
    }

    @Override
    public List<DoctorBrandDetails> getCommonPlusDoctorBrands(Long doctorId) {
        doctorRepository
                .findByIdAndActiveTrue(doctorId)
                .orElseThrow(() -> new InvalidRequestException(
                        ErrorCode.BAD_REQUEST, "Doctor not found with" + doctorId + " this id"));
        List<Brand> commonBrandList = brandRepository.findByIsCommonTrue();

        List<DoctorBrand> individualBrandList = doctorBrandRepository.findByDoctorId(doctorId);

        // Create a set to store unique brand IDs
        Set<Long> uniqueBrandIds = new HashSet<>();

        // Create a list to store DoctorBrandDetails objects
        List<DoctorBrandDetails> doctorBrandDetailsList = new ArrayList<>();

        // Process common brands
        for (Brand commonBrand : commonBrandList) {
            DoctorBrandDetails commonBrandDetails = new DoctorBrandDetails();
            commonBrandDetails.setBrandName(commonBrand.getBrandName());
            commonBrandDetails.setBrandId(commonBrand.getId()); // Set the common brand's ID
            doctorBrandDetailsList.add(commonBrandDetails);
            uniqueBrandIds.add(commonBrand.getId()); // Add the brand ID to the set
        }

        // Process individual brands
        for (DoctorBrand individualBrand : individualBrandList) {
            Brand brand = individualBrand.getBrand(); // Get the individual brand associated with the doctor

            // Check if the brand ID is already in the set (avoid duplicates)
            if (!uniqueBrandIds.contains(brand.getId())) {
                DoctorBrandDetails individualBrandDetails = new DoctorBrandDetails();
                individualBrandDetails.setBrandName(brand.getBrandName());
                individualBrandDetails.setBrandId(brand.getId()); // Set the individual brand's ID
                doctorBrandDetailsList.add(individualBrandDetails);
                uniqueBrandIds.add(brand.getId()); // Add the brand ID to the set
            }
        }

        if (doctorBrandDetailsList.isEmpty()) {
            addSpecificBrandsToDatabaseFromConfig();
            List<Brand> commonBrandListNewlyAdded = brandRepository.findByIsCommonTrue();
            for (Brand commonBrand : commonBrandListNewlyAdded) {
                DoctorBrandDetails commonBrandDetails = new DoctorBrandDetails();
                commonBrandDetails.setBrandName(commonBrand.getBrandName());
                commonBrandDetails.setBrandId(commonBrand.getId()); // Set the common brand's ID
                doctorBrandDetailsList.add(commonBrandDetails);
                uniqueBrandIds.add(commonBrand.getId()); // Add the brand ID to the set
            }
        }

        // Sort the list alphabetically by brand name
        doctorBrandDetailsList.sort(Comparator.comparing(DoctorBrandDetails::getBrandName));

        return doctorBrandDetailsList;
    }

    private void addSpecificBrandsToDatabaseFromConfig() {
        String specificBrands = environment.getProperty("specific.brands");
        String[] specificBrandNames = specificBrands.split(",");

        for (String brandName : specificBrandNames) {
            Brand brand = new Brand();
            brand.setBrandName(brandName.trim());
            brand.setCommon(true);
            brandRepository.save(brand);
        }
    }

    @Override
    public void selectBrands(List<Long> selectedBrandIds, Long doctorId) {

        Doctor doctor = doctorRepository
                .findByIdAndActiveTrue(doctorId)
                .orElseThrow(() ->
                        new InvalidRequestException(ErrorCode.BAD_REQUEST, "Doctor not found with ID: " + doctorId));
        List<Brand> commonBrands = brandRepository.findAllById(selectedBrandIds);
        for (Brand brand : commonBrands) {
            doctorBrandRepository.save(DoctorBrandMapper.fromDoctorAndBrand(doctor, brand));
        }
    }
}
