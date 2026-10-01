package com.dentalstack.patient.feature.invitation.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "patient_customer_invitation")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCustomerInvitation extends BaseEntity {

    private String invitationCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    private Long parentTaskTrackerId;
}
