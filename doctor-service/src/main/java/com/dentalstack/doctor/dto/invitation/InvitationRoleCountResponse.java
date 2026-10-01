package com.dentalstack.doctor.dto.invitation;

import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.summary.invitation.InvitationRolesCountSummary;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for invitation counts grouped by sender and receiver roles
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvitationRoleCountResponse {

    /**
     * Direction of invitation: "SENT" or "RECEIVED"
     * SENT: You sent this invitation to someone
     * RECEIVED: Someone sent this invitation to you
     */
    private String direction;

    /**
     * Role of the person who sent the invitation
     */
    private InvitationRole senderRole;

    /**
     * Role of the person who received the invitation
     */
    private InvitationRole receiverRole;

    /**
     * Count of active (ACCEPTED) invitations
     */
    private Long activeCount;

    /**
     * Count of pending (PENDING, EXPIRED, REJECTED) invitations
     */
    private Long pendingCount;

    /**
     * Total count of invitations
     */
    private Long totalCount;

    /**
     * Convert from summary interface to response DTO
     */
    public static InvitationRoleCountResponse from(InvitationRolesCountSummary summary) {
        return InvitationRoleCountResponse.builder()
                .direction(summary.getDirection())
                .senderRole(summary.getSenderRole())
                .receiverRole(summary.getReceiverRole())
                .activeCount(summary.getActiveCount() != null ? summary.getActiveCount() : 0L)
                .pendingCount(summary.getPendingCount() != null ? summary.getPendingCount() : 0L)
                .totalCount(summary.getTotalCount())
                .build();
    }

    /**
     * Convert list of summaries to response DTOs
     */
    public static List<InvitationRoleCountResponse> fromList(List<InvitationRolesCountSummary> summaries) {
        return summaries.stream().map(InvitationRoleCountResponse::from).collect(Collectors.toList());
    }
}
