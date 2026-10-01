package com.dentalstack.doctor.dto.user;

import com.dentalstack.doctor.enums.doctor.DoctorRole;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateUserProfile {

    @NotEmpty(message = "At least one role is required")
    private List<DoctorRole> roles;

    private long doctorId;
    private Long profileId;
}
