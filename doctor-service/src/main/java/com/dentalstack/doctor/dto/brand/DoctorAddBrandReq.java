package com.dentalstack.doctor.dto.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DoctorAddBrandReq {

    @NotBlank(message = "Brand name is required")
    private String brandName;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
}
