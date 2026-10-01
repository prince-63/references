package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.invitation.dto.AllInvitationDetails;
import com.dentalstack.patient.feature.invitation.dto.NotSetUpTreatmentPatient;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class AllLeadDetails {
    private List<WaitingListPatientResponse> waitingList;
    private List<NotSetUpTreatmentPatient> awaitingTreatment;
    private List<AllInvitationDetails> patientInvitations;

    public AllLeadDetails(
            List<WaitingListPatientResponse> waitingList,
            List<NotSetUpTreatmentPatient> awaitingTreatment,
            List<AllInvitationDetails> patientInvitations) {
        this.waitingList = waitingList;
        this.awaitingTreatment = awaitingTreatment;
        this.patientInvitations = patientInvitations;
    }
}
