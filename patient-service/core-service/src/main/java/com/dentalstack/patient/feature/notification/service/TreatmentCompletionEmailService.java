package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.treatment.dto.TreatmentCompletedEmailForOrgReq;

public interface TreatmentCompletionEmailService {

    void sendTreatmentCompletedEmailToOrg(TreatmentCompletedEmailForOrgReq request);
}
