package com.dentalstack.chat.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
@Setter
@Entity
@Table(name = "doctor_patient_chat")
public class DoctorPatientChat extends BaseEntity {

    private Long patientId;

    private Long doctorId;

    private Boolean isAdded;
}
