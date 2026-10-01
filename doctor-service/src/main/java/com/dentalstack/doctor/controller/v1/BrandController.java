package com.dentalstack.doctor.controller.v1;

import static com.dentalstack.doctor.consts.SwaggerConsts.WEB;

import com.dentalstack.doctor.dto.brand.AddBrandRequest;
import com.dentalstack.doctor.dto.brand.DoctorAddBrandReq;
import com.dentalstack.doctor.dto.brand.DoctorBrandDetails;
import com.dentalstack.doctor.dto.responsebuilder.ResponseBuilder;
import com.dentalstack.doctor.dto.responsebuilder.StatusEnum;
import com.dentalstack.doctor.dto.responsebuilder.SuccessCode;
import com.dentalstack.doctor.exception.doctor.ErrorCode;
import com.dentalstack.doctor.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "brand", description = "Brand APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/brand/v1/")
@Slf4j
public class BrandController {

    private final BrandService brandService;

    @PostMapping("/add")
    @Operation(summary = "Common brand", description = "Add common brand for every doctor")
    public ResponseEntity<?> addCommonBrand(@Valid @RequestBody AddBrandRequest addBrandRequest) {

        String message = "";
        message = brandService.addBrand(addBrandRequest);
        if (Objects.equals(message, "True")) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(StatusEnum.SUCCESS.getValue(), SuccessCode.OK.getCode(), "Brand added successfully")
                            .build());
        } else {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Brand not added. Something went wrong in request data")
                            .build());
        }
    }

    @Tag(name = WEB)
    @PostMapping("/add/individual")
    @Operation(description = "d")
    public ResponseEntity<?> addIndividualBrand(@Valid @RequestBody DoctorAddBrandReq doctorAddBrandReq) {

        String message = "";
        message = brandService.addIndividualBrand(doctorAddBrandReq);
        if (Objects.equals(message, "True")) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(StatusEnum.SUCCESS.getValue(), SuccessCode.OK.getCode(), "Brand added successfully")
                            .build());
        } else {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Brand not added. Something went wrong in request data")
                            .build());
        }
    }

    @GetMapping("/get/{doctorId}")
    @Operation(summary = "Doctor brand", description = "Getting particular doctor brand plus common brand")
    public ResponseEntity<?> getDoctorBrand(@PathVariable(value = "doctorId") Long doctorId) {

        List<DoctorBrandDetails> doctorBrandDetails = brandService.getCommonPlusDoctorBrands(doctorId);

        return ResponseEntity.ok(doctorBrandDetails);
    }

    @GetMapping("/get/selected/{doctorId}")
    @Operation(summary = "Doctor selected brand", description = "Getting selected brands only of doctor")
    public ResponseEntity<?> getSelectedBrand(@PathVariable(value = "doctorId") Long doctorId) {

        List<DoctorBrandDetails> doctorBrandDetails = brandService.getDoctorSelectedBrand(doctorId);

        return ResponseEntity.ok(doctorBrandDetails);
    }

    @PostMapping("/select")
    @Operation(summary = "Select Brands", description = "Allow doctors to select brands from the common list.")
    public ResponseEntity<String> selectBrands(@RequestBody List<Long> selectedBrandIds, @RequestParam Long doctorId) {
        brandService.selectBrands(selectedBrandIds, doctorId);
        return ResponseEntity.ok("Brands selected successfully.");
    }
}
