package com.dentalstack.doctor.dto.doctor;

import com.dentalstack.doctor.enums.doctor.DoctorRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddDoctorRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String mobile;
    private String countryCode;
    private Boolean isOnBoardScreenVisited;
    private String invitationCode;

    @NotEmpty(message = "At least one role is required")
    private List<DoctorRole> roles;

    private String salutation;
    private String brand;
    private List<DoctorRole> selectedRoles;
    private Long organizationId;
    private String xOrgName;
}
