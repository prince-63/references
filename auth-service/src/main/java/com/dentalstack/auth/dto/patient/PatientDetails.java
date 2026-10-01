package com.dentalstack.auth.dto.patient;

import com.dentalstack.auth.enums.patient.PatientStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatientDetails {
    private Long id;
    private String firstName;
    private String lastName;
    private String middleName;
    private String orgName;

    private String profilePictureUrl;

    private List<AddressDetails> addresses = new ArrayList<>();

    private Integer age;
    private String email;
    private String mobile;
    private String UUID;
    private PatientStatus status;

    private ZonedDateTime lastLoginAt;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AddressDetails {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String country;
        private int pincode;
    }
}
