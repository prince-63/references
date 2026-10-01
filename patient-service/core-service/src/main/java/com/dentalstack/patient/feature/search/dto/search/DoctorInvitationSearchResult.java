package com.dentalstack.patient.feature.search.dto.search;

import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctorinvitation.summary.DoctorInvitationSearchProjection;
import lombok.Getter;

@Getter
public class DoctorInvitationSearchResult extends GlobalSearchResult {
    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final InvitationRole role;
    private final InvitationStatus status;
    private final String invitationType;

    public DoctorInvitationSearchResult(DoctorInvitationSearchProjection projection) {
        super(ResultType.DOCTOR_INVITATION);
        this.id = projection.getId();
        this.firstName = projection.getFirstName();
        this.lastName = projection.getLastName();
        this.email = projection.getEmail();
        this.role = projection.getRoles();
        this.status = projection.getStatus();
        this.invitationType = projection.getInvitationType();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
