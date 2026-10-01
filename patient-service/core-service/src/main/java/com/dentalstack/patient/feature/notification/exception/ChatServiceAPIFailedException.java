package com.dentalstack.patient.feature.notification.exception;

import com.dentalstack.patient.global.dto.ErrorInfo;
import com.dentalstack.patient.global.exception.ServiceException;

public class ChatServiceAPIFailedException extends ServiceException {
    public ChatServiceAPIFailedException(ErrorInfo errorInfo, String url) {
        super(errorInfo, String.format("Chat service API failed for url %s.", url));
    }
}
