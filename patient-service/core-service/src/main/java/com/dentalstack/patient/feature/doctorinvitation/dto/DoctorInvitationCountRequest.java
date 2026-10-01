package com.dentalstack.patient.feature.doctorinvitation.dto;

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

    public static DoctorInvitationCountRequest from(
            Long doctorId, Long organizationId, Long profileId, boolean fromOrder) {
        return DoctorInvitationCountRequest.builder()
                .doctorId(doctorId)
                .profileId(profileId)
                .organizationId(organizationId)
                .fromOrder(fromOrder)
                .build();
    }
}
