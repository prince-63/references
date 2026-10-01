package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.language.Language;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvitePatientRequest {
    @NotNull
    private String firstName;

    private String lastName;
    private String email;
    private String mobile;
    private CountryCode countryCode;
    private String practiceLocation;
    private Integer age;
    private String gender;
    private String customerMappedId;
    private long inviterId;

    private String chiefComplaint;

    @NotNull
    private UserType inviterUserType;

    private Language language;
    private Long practiceLocationId;
    private String country;
    private String city;
    private String state;

    private Long practiceProfileId;
    private String patientUuid;
    private String practiceInviteCode;

    @Nullable
    private PatientType patientType;

    private Long doctorId;
    private Long organizationId;
    private Long profileId;
    private Long receiverDoctorId;
    private Long receiverOrganizationId;
    private Long receiverProfileId;
    private Long currentStep;

    public void setMobile(String mobile) {
        this.mobile = StringUtils.hasText(mobile) ? mobile : null;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase() : null;
    }
}
