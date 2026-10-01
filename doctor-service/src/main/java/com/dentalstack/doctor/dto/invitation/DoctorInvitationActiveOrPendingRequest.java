package com.dentalstack.doctor.dto.invitation;

import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.enums.invitation.SortOrder;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorInvitationActiveOrPendingRequest {

    private long doctorId;
    private long organizationId;
    private long profileId;

    @NotNull(message = "Invitation status is required")
    private InvitationStatus invitationStatus;

    @NotNull(message = "Sort order is required")
    private SortOrder sortOrder;

    private int pageNumber;
    private int pageSize;
    private String search;

    @NotEmpty(message = "At least one invitation role is required")
    private List<InvitationRole> invitationRoles;

    private List<InvitationRole> inviterOwnerRoles;
    private List<InvitationRole> receiversInvitationRoles;
}
