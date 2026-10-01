package com.dentalstack.doctor.dto.rbac;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddProfileRequest {

    private long inviterDoctorId;
    private long organizationId;
    private long invitedDotorId;
    private long profileId;

    @NotNull(message = "Role is required")
    private DoctorRole roles;

    private enum DoctorRole {
        CONSULTING_ORTHODONTIST,
        ADMIN
    }
}
