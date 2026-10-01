package com.dentalstack.patient.global.exception;

import com.dentalstack.patient.global.dto.ErrorInfo;
import jakarta.annotation.Nullable;
import lombok.Getter;

@Getter
public class ServiceException extends RuntimeException {
    @Nullable
    protected final ErrorInfo errorInfo;

    protected final String message;

    public ServiceException(@Nullable ErrorInfo errorInfo, String message) {
        super(message);
        this.errorInfo = errorInfo;
        this.message = message;
    }
}
