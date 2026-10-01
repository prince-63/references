package com.dentalstack.doctor.service.invitation;

import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.exception.invitation.InvitationExpiredException;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Invitation validation logic extracted from the DoctorInvitation entity (CS-19 fix).
 * Entities should not throw exceptions — validation belongs in the service layer.
 */
public final class InvitationValidator {

    private InvitationValidator() {
        // Utility class
    }

    /**
     * Validates that the invitation has not expired.
     *
     * @param invitation the invitation to validate
     * @throws InvitationExpiredException if the invitation is expired
     */
    public static void validateNotExpired(DoctorInvitation invitation) {
        if (invitation.getStatus() == InvitationStatus.EXPIRED) {
            throw new InvitationExpiredException();
        }
    }

    /**
     * If the invitation is expired, regenerate the code and reset status for re-sending.
     * This mutates the invitation in-place (same behavior as the original entity method).
     *
     * @param invitation the invitation to validate/refresh
     */
    public static void refreshIfExpired(DoctorInvitation invitation) {
        if (invitation.getStatus() == InvitationStatus.EXPIRED) {
            String newCode = UUID.randomUUID().toString();
            invitation.getDoctorInvitationCode().setCode(newCode);
            invitation.setStatus(InvitationStatus.PENDING);
            invitation.setExpiresAt(ZonedDateTime.now().plusDays(1000));
        }
    }
}
