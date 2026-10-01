package com.dentalstack.patient.feature.consent_template.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class DefaultConsentTemplateNotFoundException extends BusinessException {
    public DefaultConsentTemplateNotFoundException(String type, String location) {
        super(
                BusinessErrorCode.DEFAULT_CONSENT_TEMPLATE_NOT_FOUND,
                String.format("No default consent template found for type: %s and location: %s", type, location));
    }
}
