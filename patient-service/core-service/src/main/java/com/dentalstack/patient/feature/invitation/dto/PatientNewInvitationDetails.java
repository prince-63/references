package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientNewInvitationDetails {
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

    private InvitationStatus invitationStatus;

    @Deprecated
    private String statusList;

    @Deprecated
    private String city;

    @Deprecated
    private ZonedDateTime requestDate;

    private int sentCount;

    public static PatientNewInvitationDetails from(Invitation invitation, DoctorDetails doctor) {

        assert invitation.getPatientInvitation() != null;
        return PatientNewInvitationDetails.builder()
                .invitationId(invitation.getId())
                .doctorId(invitation.getInviterId())
                .doctorName(doctor.getFirstName())
                .doctorEmail(doctor.getEmail())
                .patientEmail(invitation.getPatientInvitation().getPatient().getEmail())
                .doctorProfilePictureUrl(doctor.getDoctorImage())
                .mobileNo(invitation.getPatientInvitation().getPatient().getMobileNo())
                .patientProfile(invitation.getPatientInvitation().getPatient().getProfilePictureUrl())
                .requestDate(invitation.getCreatedAt())
                .patientId(invitation.getPatientInvitation().getPatient().getId())
                .patientDetails(
                        PatientDetails.from(invitation.getPatientInvitation().getPatient()))
                .doctorDetails(doctor)
                .statusList("RequestSent")
                .invitationStatus(invitation.getStatus())
                .patientName(String.join(
                        " ",
                        invitation.getPatientInvitation().getFirstName(),
                        invitation.getPatientInvitation().getLastName()))
                .sentCount(invitation.getSentCount())
                .build();
    }
}
