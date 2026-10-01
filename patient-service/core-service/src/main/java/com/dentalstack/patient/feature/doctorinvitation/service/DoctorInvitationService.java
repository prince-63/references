package com.dentalstack.patient.feature.doctorinvitation.service;

import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationRequest;
import com.dentalstack.patient.feature.doctorinvitation.entity.DoctorInvitation;

public interface DoctorInvitationService {
    DoctorInvitation inviteDoctor(DoctorInvitationRequest request, String xOrgName);
}
