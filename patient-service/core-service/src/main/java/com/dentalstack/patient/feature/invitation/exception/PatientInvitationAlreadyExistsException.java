package com.dentalstack.patient.feature.invitation.exception;

import com.dentalstack.patient.feature.patient.entity.PatientInvitation;
import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class PatientInvitationAlreadyExistsException extends BusinessException {
    public PatientInvitationAlreadyExistsException(PatientInvitation patientInvitation) {
        super(
                BusinessErrorCode.PATIENT_INVITATION_ALREADY_EXISTS,
                String.format(
                        "Invitation to the patient %d by the doctor %d already exists in status %s",
                        patientInvitation.getPatient().getId(),
                        patientInvitation.getDoctorId(),
                        patientInvitation.getStatus()));
    }
}
