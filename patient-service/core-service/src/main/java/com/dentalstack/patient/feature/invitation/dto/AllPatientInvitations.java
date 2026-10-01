package com.dentalstack.patient.feature.invitation.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllPatientInvitations {
    private List<PatientInvitationDetails> invitations;
}
