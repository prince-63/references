package com.dentalstack.doctor.dto.doctor;

import com.dentalstack.doctor.entity.Doctor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDoctor {

    private String profileImage;

    private String specialization;

    private String socialHandle;

    private Date dateOfBirth;

    private String medicalRegistrationDocument;

    private String doctorType;

    private String healthCareNumber;

    private String gender;

    private String dciRegistrationNumber;

    private String dentalCouncilName;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @Email(message = "Email must be valid")
    private String email;

    private String mobile;

    private String countryCode;

    private String city;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Boolean isOnBoardScreenVisited;

    private String description;

    private String countryName;

    private String state;

    private boolean isDrToDisplay;

    public static void updateForm(UpdateDoctor updateDoctor, Doctor doctor) {
        doctor.setFirstName(updateDoctor.getFirstName());
        doctor.setLastName(updateDoctor.getLastName());
        if (updateDoctor.getProfileImage() != null) {
            doctor.setProfileImage(updateDoctor.getProfileImage());
        }
        doctor.setEmail(updateDoctor.getEmail());
        doctor.setMobile(updateDoctor.getMobile());
        doctor.setCountryCode(updateDoctor.getCountryCode());
        doctor.setIsOnBoardScreenVisited(updateDoctor.getIsOnBoardScreenVisited());
        doctor.setDescription(updateDoctor.getDescription());
        doctor.setCountryName(updateDoctor.getCountryName());
        doctor.setDrToDisplay(updateDoctor.isDrToDisplay());
    }

    public static void updateDoctorForMobile(UpdateDoctorForMobile updateDoctor, Doctor doctor) {
        doctor.setFirstName(updateDoctor.getFirstName());
        doctor.setLastName(updateDoctor.getLastName());
        if (updateDoctor.getProfileImage() != null) {
            doctor.setProfileImage(updateDoctor.getProfileImage());
        }
        doctor.setDescription(updateDoctor.getDescription());
    }
}
