package com.dental_stack.files.migration.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(
        name = "patient",
        indexes = {
            @Index(name = "UX_patient_UUID", columnList = "UUID", unique = true),
            @Index(name = "IX_patient_email", columnList = "email"),
            @Index(name = "IX_patient_mobile_no", columnList = "mobileNo"),
            @Index(name = "IX_patient_doctor_id", columnList = "doctorId"),
            @Index(
                    name = "IX_patient_doctor_id_patient_status",
                    columnList = "doctorId, patientStatus"),
            @Index(
                    name = "IX_patient_mobile_country_code_email",
                    columnList = "mobileNo, countryCode, email"),
            @Index(
                    name = "IX_patient_first_name_last_name_email",
                    columnList = "firstName, lastName, email"),
            @Index(name = "IX_patient_added_by_user_id", columnList = "addedByUserId")
        })
@Getter
@Setter
@Builder
public class Patient extends BaseEntity {}
