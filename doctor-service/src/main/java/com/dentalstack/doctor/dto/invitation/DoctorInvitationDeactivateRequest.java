package com.dentalstack.doctor.dto.invitation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorInvitationDeactivateRequest {
    private long invitationId;
    private long profileId;
}
