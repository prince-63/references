package com.dentalstack.patient.global.exception;

import com.dentalstack.patient.global.dto.ErrorInfo;

public class ChatServiceAPIFailedException extends ServiceException {
    public ChatServiceAPIFailedException(ErrorInfo errorInfo, String url) {
        super(errorInfo, String.format("Chat service API failed for url %s.", url));
    }
}
