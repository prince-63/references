package com.dentalstack.auth.dto;

import com.dentalstack.auth.exception.BusinessErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ErrorInfo {
    private String message;
    private BusinessErrorCode errorCode;
}
