package com.dentalstack.doctor.dto.invitation;

import com.dentalstack.doctor.summary.invitation.InvitationRolesCountSummary;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper response containing both sent and received invitation counts
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvitationRoleCountsWrapper {

    /**
     * Invitations you sent to others, grouped by roles
     */
    private List<InvitationRoleCountResponse> sentInvitations;

    /**
     * Invitations you received from others, grouped by roles
     */
    private List<InvitationRoleCountResponse> receivedInvitations;

    /**
     * All invitations (sent + received) with direction indicator
     */
    private List<InvitationRoleCountResponse> allInvitations;

    /**
     * Summary totals for sent invitations
     */
    private Long totalActiveSent;

    private Long totalPendingSent;

    /**
     * Summary totals for received invitations
     */
    private Long totalActiveReceived;

    private Long totalPendingReceived;

    /**
     * Grand totals (sent + received)
     */
    private Long totalActive;

    private Long totalPending;

    /**
     * Calculate totals from the lists
     */
    public static InvitationRoleCountsWrapper from(
            List<InvitationRolesCountSummary> sentSummaries,
            List<InvitationRolesCountSummary> receivedSummaries,
            List<InvitationRolesCountSummary> allSummaries) {

        List<InvitationRoleCountResponse> sentResponses = InvitationRoleCountResponse.fromList(sentSummaries);
        List<InvitationRoleCountResponse> receivedResponses = InvitationRoleCountResponse.fromList(receivedSummaries);
        List<InvitationRoleCountResponse> allResponses = InvitationRoleCountResponse.fromList(allSummaries);

        return InvitationRoleCountsWrapper.builder()
                .sentInvitations(sentResponses)
                .receivedInvitations(receivedResponses)
                .allInvitations(allResponses)
                .totalActiveSent(sentResponses.stream()
                        .mapToLong(InvitationRoleCountResponse::getActiveCount)
                        .sum())
                .totalPendingSent(sentResponses.stream()
                        .mapToLong(InvitationRoleCountResponse::getPendingCount)
                        .sum())
                .totalActiveReceived(receivedResponses.stream()
                        .mapToLong(InvitationRoleCountResponse::getActiveCount)
                        .sum())
                .totalPendingReceived(receivedResponses.stream()
                        .mapToLong(InvitationRoleCountResponse::getPendingCount)
                        .sum())
                .totalActive(allResponses.stream()
                        .mapToLong(InvitationRoleCountResponse::getActiveCount)
                        .sum())
                .totalPending(allResponses.stream()
                        .mapToLong(InvitationRoleCountResponse::getPendingCount)
                        .sum())
                .build();
    }
}
