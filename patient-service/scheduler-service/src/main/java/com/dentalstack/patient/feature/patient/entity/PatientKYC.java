package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Builder
@Table(name = "patient_kyc")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PatientKYC extends BaseEntity {

    @NotNull
    @OneToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private boolean mobileVerified;

    private boolean emailVerified;

    public static PatientKYC newFrom(Patient patient) {
        return new PatientKYC(patient, false, false);
    }
}
