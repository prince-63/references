package com.dentalstack.patient.feature.consent_template.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ConsentTemplateNotFoundException extends BusinessException {
    public ConsentTemplateNotFoundException(Long templateId) {
        super(
                BusinessErrorCode.CONSENT_TEMPLATE_NOT_FOUND,
                String.format("Consent template not found with ID: %d", templateId));
    }
}
