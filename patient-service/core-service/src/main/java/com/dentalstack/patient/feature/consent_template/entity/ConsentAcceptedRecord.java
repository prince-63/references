package com.dentalstack.patient.feature.consent_template.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "consent_accepted_record")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentAcceptedRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_from_profile_id")
    private UserProfile acceptedFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_patient_id")
    private Patient acceptedByPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_profile_id")
    private UserProfile acceptedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consent_template_id")
    private ConsentTemplate consentTemplate;

    @Column(columnDefinition = "TEXT")
    private String content;
}
