package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.braces.dto.BracesJourneyDetails;
import com.dentalstack.patient.feature.invitation.dto.AllInvitationDetailsForMobile;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MobileDashboardDoctorDetails {

    List<AllInvitationDetailsForMobile> sentInvitations;
    List<BracesJourneyDetails> bracesJourneyDetails;
}
