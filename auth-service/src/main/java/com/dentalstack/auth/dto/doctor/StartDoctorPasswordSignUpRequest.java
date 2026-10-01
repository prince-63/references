package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.enums.patient.UserType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StartDoctorPasswordSignUpRequest {
    @NotNull
    private String email;

    @NotNull
    private String password;

    @NotNull
    private UserType authType;
}
