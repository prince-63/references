package com.dentalstack.patient.feature.aligner.dto.aligner.production.lab;

import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddAlignerProductionLabRequest {
    @NotNull
    private String name;

    @Nullable
    private String logoUrl;

    private long userId;

    @NotNull
    private UserType userType;

    private Boolean isDefault = false;
}
