package com.dentalstack.doctor.dto.invitation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorInvitationCountRequest {
    private long doctorId;
    private long profileId;
    private long organizationId;
    private boolean fromOrder;
}
