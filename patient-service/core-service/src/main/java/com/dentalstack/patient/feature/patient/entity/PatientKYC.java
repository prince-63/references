package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.feature.patient.dto.RegisterPatientRequest;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private boolean mobileVerified;

    private boolean emailVerified;

    public static PatientKYC from(RegisterPatientRequest request, Patient patient) {
        return new PatientKYC(patient, true, false);
    }

    public static PatientKYC newFrom(Patient patient) {
        return new PatientKYC(patient, false, false);
    }
}
