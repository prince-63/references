package com.dentalstack.patient.feature.invitation.dto.v2;

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
public class InvitePatientRequestV2 {
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
    private String chiefComplaint;

    @NotNull
    private UserType inviterUserType;

    private Language language;
    private Long practiceLocationId;
    private String country;
    private String city;
    private String state;
    private String patientUuid;

    @Nullable
    private PatientType patientType;

    private Long practiceProfileId;

    private Long inviterId;
    private Long doctorId;
    private Long organizationId;
    private Long profileId;
    private Long receiverDoctorId;
    private Long receiverOrganizationId;
    private Long receiverProfileId;

    private String practiceInviteCode;

    public void setMobile(String mobile) {
        this.mobile = StringUtils.hasText(mobile) ? mobile : null;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase() : null;
    }
}
