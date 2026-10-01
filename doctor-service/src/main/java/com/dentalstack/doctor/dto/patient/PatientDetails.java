package com.dentalstack.doctor.dto.patient;

import com.dentalstack.doctor.enums.patient.AddressDetails;
import com.dentalstack.doctor.enums.patient.PatientStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.ZonedDateTime;
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

    private String profilePictureUrl;

    private List<AddressDetails> addresses;

    private Integer age;
    private String email;
    private String mobile;
    private String UUID;
    private PatientStatus status;

    private ZonedDateTime lastLoginAt;
}
