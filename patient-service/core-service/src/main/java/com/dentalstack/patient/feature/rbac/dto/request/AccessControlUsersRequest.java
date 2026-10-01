package com.dentalstack.patient.feature.rbac.dto.request;

import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccessControlUsersRequest {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private String search;

    @NotNull
    private InvitationStatus status;

    private Long subRoleId;
    private int pageNumber;
    private int pageSize;
}
