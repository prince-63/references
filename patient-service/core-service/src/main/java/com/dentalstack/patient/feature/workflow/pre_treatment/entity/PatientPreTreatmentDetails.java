package com.dentalstack.patient.feature.workflow.pre_treatment.entity;

import com.dentalstack.patient.feature.caserecord.entity.CaseRecord;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Builder
@Entity
@Table(name = "patient_pre_treatment_details")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class PatientPreTreatmentDetails extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_profile_id")
    private UserProfile addedBy;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_record_id")
    private CaseRecord caseRecord;

    @Nullable
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    private boolean isActive;
}
