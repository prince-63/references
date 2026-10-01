package com.dentalstack.patient.feature.doctorinvitation.summary;

import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;

public interface DoctorInvitationSearchProjection {
    Long getId();

    String getFirstName();

    String getLastName();

    String getEmail();

    InvitationRole getRoles();

    InvitationStatus getStatus();

    String getInvitationType();
}
