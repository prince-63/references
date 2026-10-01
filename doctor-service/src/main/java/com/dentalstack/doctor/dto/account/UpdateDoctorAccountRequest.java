package com.dentalstack.doctor.dto.account;

import com.dentalstack.doctor.enums.doctor.FileAction;
import com.dentalstack.doctor.enums.user.CountryCode;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateDoctorAccountRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String mobileNo;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotNull(message = "Profile ID is required")
    private Long profileId;

    private String displayName;
    private CountryCode countryCode;
    private String salutation;
    private FileAction fileActionProfile;
    private FileAction fileActionDisplay;
}
