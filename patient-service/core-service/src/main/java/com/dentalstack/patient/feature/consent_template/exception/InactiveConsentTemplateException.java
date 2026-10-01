package com.dentalstack.patient.feature.consent_template.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class InactiveConsentTemplateException extends BusinessException {
    public InactiveConsentTemplateException() {
        super(BusinessErrorCode.INACTIVE_CONSENT_TEMPLATE, "Cannot set an inactive template as default");
    }
}
