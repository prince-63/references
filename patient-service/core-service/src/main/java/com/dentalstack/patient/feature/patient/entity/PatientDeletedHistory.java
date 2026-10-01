package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.ZonedDateTime;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "patient_deleted_history")
public class PatientDeletedHistory extends BaseEntity {

    private Long deleterId;

    private Long patientId;

    private String firstName;

    private String lastName;

    private String email;
    private String mobile;
    private CountryCode countryCode;

    private ZonedDateTime deletedAt;

    public static PatientDeletedHistory from(Patient patient, Long doctorId) {
        return PatientDeletedHistory.builder()
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .email(patient.getEmail())
                .mobile(patient.getMobileNo())
                .countryCode(patient.getCountryCode())
                .patientId(patient.getId())
                .deleterId(doctorId)
                .deletedAt(ZonedDateTime.now())
                .build();
    }
}
