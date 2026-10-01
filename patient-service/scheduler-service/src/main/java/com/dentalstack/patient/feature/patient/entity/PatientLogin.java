package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "patient_login")
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PatientLogin extends BaseEntity {
    @NotNull
    private String mobileNo;

    @NotNull
    private CountryCode countryCode;

    private ZonedDateTime lastLoginAt;
    private String referralCode;

    @OneToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    public static PatientLogin newFrom(Patient patient) {
        return PatientLogin.builder()
                .mobileNo(patient.getMobileNo())
                .patient(patient)
                .countryCode(patient.getCountryCode())
                .build();
    }
}
