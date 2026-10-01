package com.dental_stack.files.migration.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "patient_doctor_organization",
        indexes = {
            @Index(
                    name = "IX_doctor_org_patient",
                    columnList = "doctor_id, organization_id, patient_id")
        })
@Getter
@Setter
@Builder
public class PatientDoctorOrganization extends BaseEntity {}
