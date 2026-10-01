package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.Status;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientInvitation;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientInvitationDetails {
    private Long invitationId;

    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;
    private String doctorEmail;
    private String doctorProfilePictureUrl;

    private DoctorDetails doctorDetails;
    private PatientDetails patientDetails;

    @Deprecated
    private String mobileNo;

    @Deprecated
    private String patientEmail;

    @Deprecated
    private String patientProfile;

    @Deprecated
    private Status status;

    private InvitationStatus invitationStatus;

    @Deprecated
    private String statusList;

    @Deprecated
    private String city;

    @Deprecated
    private ZonedDateTime requestDate;

    private int sentCount;

    public static PatientInvitationDetails from(PatientInvitation patientInvitation) {
        return PatientInvitationDetails.from(patientInvitation, new DoctorDetails());
    }

    public static PatientInvitationDetails from(PatientInvitation patientInvitation, DoctorDetails doctor) {
        Patient patient = patientInvitation.getPatient();

        return PatientInvitationDetails.builder()
                .invitationId(patientInvitation.getId())
                .doctorId(patientInvitation.getDoctorId())
                .doctorName(patientInvitation.getDoctorName())
                .doctorEmail(patientInvitation.getDoctorEmail())
                .patientEmail(patientInvitation.getPatientEmail())
                .doctorProfilePictureUrl(doctor.getDoctorImage())
                .mobileNo(patientInvitation.getPatientMobileNo())
                .status(patientInvitation.getStatus())
                .patientProfile(patient.getProfilePictureUrl())
                .requestDate(patientInvitation.getCreatedAt())
                .patientId(patientInvitation.getPatient().getId())
                .patientDetails(PatientDetails.from(patient))
                .doctorDetails(doctor)
                .statusList("RequestSent")
                .patientName(String.join(" ", patient.getFirstName(), patient.getLastName()))
                .sentCount(patientInvitation.getSentCount())
                .build();
    }

    public static PatientInvitationDetails from(Invitation patientInvitation, DoctorDetails doctor) {

        assert patientInvitation.getPatientInvitation() != null;
        return PatientInvitationDetails.builder()
                .invitationId(patientInvitation.getId())
                .doctorId(patientInvitation.getInviterId())
                .doctorName(doctor.getFirstName())
                .doctorEmail(doctor.getEmail())
                .patientEmail(patientInvitation.getPatientInvitation().getEmail())
                .doctorProfilePictureUrl(doctor.getDoctorImage())
                .mobileNo(patientInvitation.getPatientInvitation().getEmail())
                .patientProfile(
                        patientInvitation.getPatientInvitation().getPatient().getProfilePictureUrl())
                .requestDate(patientInvitation.getCreatedAt())
                .patientId(patientInvitation.getPatientInvitation().getPatient().getId())
                .patientDetails(PatientDetails.from(
                        patientInvitation.getPatientInvitation().getPatient()))
                .doctorDetails(doctor)
                .statusList("RequestSent")
                .invitationStatus(patientInvitation.getStatus())
                .patientName(String.join(
                        " ",
                        patientInvitation.getPatientInvitation().getFirstName(),
                        patientInvitation.getPatientInvitation().getLastName()))
                .build();
    }
}
