package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.feature.invitation.dto.PatientInvitationRequest;
import com.dentalstack.patient.feature.invitation.enums.Status;
import com.dentalstack.patient.global.entity.Address;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(
        name = "patient_invitation_deprecated",
        indexes = {
            @Index(name = "IX_patient_invitation_deprecated_patient_id", columnList = "patient_id"),
            @Index(name = "IX_patient_invitation_deprecated_doctor_id", columnList = "doctorId"),
            @Index(name = "IX_patient_invitation_deprecated_status", columnList = "status"),
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientInvitation extends BaseEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @NotNull
    private Long doctorId;

    private String doctorName;

    @NotNull
    private String doctorEmail;

    private Long doctorPracticeLocationId;
    private String alignerBrandName;

    @NotNull
    private String patientMobileNo;

    @NotNull
    private CountryCode patientCountryCode;

    private String patientEmail;
    private String city;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Status status;

    private String statusList;

    @Builder.Default
    private int sentCount = 0;

    public static PatientInvitation from(PatientInvitationRequest request, Patient patient) {
        Address lastAddress = null;
        if (patient.getAddresses() != null && !patient.getAddresses().isEmpty()) {
            lastAddress = patient.getAddresses().get(patient.getAddresses().size() - 1);
        }
        String lastCity = (lastAddress != null) ? lastAddress.getCity() : null;
        return PatientInvitation.builder()
                .patient(patient)
                .doctorId(request.getDoctorId())
                .doctorName(request.getDoctorName())
                .doctorEmail(request.getDoctorEmail())
                .patientMobileNo(request.getPatientMobileNo())
                .patientCountryCode(request.getPatientCountryCode())
                .doctorPracticeLocationId(request.getDoctorPracticeLocationId())
                .alignerBrandName(request.getAlignerBrandName())
                .city(lastCity)
                .statusList("Invite Sent")
                .status(Status.PENDING)
                .sentCount(1)
                .build();
    }
}
