package com.dental_stack.notification.dto;

import com.dental_stack.notification.enums.Language;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpSendOnEmailRequest {

    private String email;

    private String otpNo;

    @Nullable private Language language;

    private String orgName;
}
