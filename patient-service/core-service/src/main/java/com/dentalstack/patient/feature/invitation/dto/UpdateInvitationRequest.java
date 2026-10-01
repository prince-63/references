package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateInvitationRequest {

    private long patientId;

    private long invitationId;

    private String lastName;

    private String email;

    private Integer age;

    private String gender;

    private String customerMappedId;

    private CountryCode countryCode;

    private String mobile;

    private InvitationStatus invitationStatus;

    private String practiceLocation;

    private String chiefComplaint;

    private String country;
    private String state;
    private String city;
    private Long profileId;
}
