package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.feature.patient.dto.RegisterPatientRequest;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.user.entity.AddressLead;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.Language;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "patient_lead",
        indexes = {
            @Index(name = "IX_patient_lead_mobile_no", columnList = "mobileNo"),
            @Index(name = "IX_patient_lead_UUID", columnList = "UUID"),
            @Index(name = "IX_patient_lead_email", columnList = "email"),
            @Index(name = "IX_patient_lead_doctor_id", columnList = "doctorId")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientLead extends BaseEntity {

    private String patientProfileUrl;
    private String firstName;

    private String lastName;

    private Integer age;

    private String gender;

    private String customerMappedId;

    private String email;

    private String mobileNo;

    @Enumerated(EnumType.STRING)
    private CountryCode countryCode;

    @Enumerated(EnumType.STRING)
    private PatientStatus patientStatus;

    private String UUID;

    private String invitationId;

    private Boolean isEmailVerified;

    private boolean isActive;

    private long doctorId;

    @Enumerated(EnumType.STRING)
    private Language language;

    @OneToMany(mappedBy = "patientLead", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<AddressLead> addresses = new ArrayList<>();

    private boolean isWhitelabel;
    private String orgName;
    private String country;
    private String city;
    private String state;

    public static PatientLead from(RegisterPatientRequest request, String uuid) {
        PatientLead patient = PatientLead.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .age(request.getAge())
                .email(request.getEmail())
                .mobileNo(request.getMobile())
                .countryCode(request.getCountryCode())
                .patientStatus(PatientStatus.ACTIVE)
                .isActive(true)
                .UUID(uuid)
                .isEmailVerified(false)
                .gender(request.getGender())
                .language(request.getLanguage())
                .isWhitelabel(request.getIsWhitelabel() != null ? request.getIsWhitelabel() : false)
                .orgName(request.getOrgName())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .build();
        AddressLead address = AddressLead.from(request.getAddress(), patient);

        patient.setAddresses(Collections.singletonList(address));

        return patient;
    }
}
