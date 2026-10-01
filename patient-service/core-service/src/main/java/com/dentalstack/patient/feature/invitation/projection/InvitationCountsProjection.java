package com.dentalstack.patient.feature.invitation.projection;

public interface InvitationCountsProjection {
    Integer getPracticeCount();

    Integer getLabSentCount();

    Integer getLabReceivedCount();

    Integer getActivePracticeCount();

    Integer getActiveCustomerCount();

    Long getLabSentAcceptedCount();

    Long getLabReceivedAcceptedCount();
}
