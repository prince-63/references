package com.dentalstack.patient.global.dto;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ErrorInfo {
    private String url;
    private String message;

    @Nullable
    private BusinessErrorCode errorCode;
}
