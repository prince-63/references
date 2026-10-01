package com.dentalstack.doctor.dto.auth;

import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.patient.Language;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FetchLoginType {
    @NotNull
    private String email;

    @NotNull
    private UserType userType;

    @Nullable
    private Language language;

    private String xOrgName;
}
