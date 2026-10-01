package com.dentalstack.doctor.summary.invitation;

import com.dentalstack.doctor.enums.invitation.InvitationRole;

/**
 * Summary interface for invitation counts grouped by sender and receiver roles
 * This provides an efficient way to get role-based invitation statistics
 */
public interface InvitationRolesCountSummary {

    /**
     * Direction of the invitation: "SENT" or "RECEIVED"
     */
    String getDirection();

    /**
     * The role of the person who sent the invitation
     */
    InvitationRole getSenderRole();

    /**
     * The role of the person who received the invitation
     */
    InvitationRole getReceiverRole();

    /**
     * Count of active (ACCEPTED) invitations for this sender-receiver role combination
     */
    Long getActiveCount();

    /**
     * Count of pending (PENDING, EXPIRED, REJECTED) invitations for this sender-receiver role combination
     */
    Long getPendingCount();

    /**
     * Total count of invitations for this sender-receiver role combination
     */
    default Long getTotalCount() {
        return (getActiveCount() != null ? getActiveCount() : 0L)
                + (getPendingCount() != null ? getPendingCount() : 0L);
    }
}
