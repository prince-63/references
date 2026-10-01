package com.dentalstack.patient.feature.consent_template.service;

import com.dentalstack.patient.feature.consent_template.dto.*;

public interface ConsentTemplateService {

    ConsentTemplateDetails addConsent(AddConsentTemplateRequest request);

    ConsentTemplateDetails updateConsent(Long id, AddConsentTemplateRequest request);

    void deleteConsent(Long templateId);

    ConsentTemplateListResponse getAllConsents(ConsentTemplateRequest request);

    ConsentTemplateDetails getDefaultConsent(GetDefaultConsentRequest request);
}
