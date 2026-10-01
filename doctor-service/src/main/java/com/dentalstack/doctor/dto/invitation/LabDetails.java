package com.dentalstack.doctor.dto.invitation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabDetails {
    private String labName;
    private Long profileId;
    private Long doctorId;
    private Long organizationId;
    private Boolean isReceivedInvitation;
}
