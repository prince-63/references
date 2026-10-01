package com.dentalstack.chat.dto.chat;

import lombok.Data;

@Data
public class PatientResponse {

    private Long patientId;

    private String patientFullName;

    private String firstName;

    private String lastName;

    private String mobileNo;

    private String city;

    private String profileImage;

    private Long profileImageId;

    private String patientCode;

    private String email;
    private Long alignerJourneyId;
}
