package com.dentalstack.auth.dto.email;

import com.dentalstack.auth.enums.language.Language;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpSendOnEmailRequest {

    private String email;

    private String otpNo;

    @Nullable
    private Language language;

    @Nullable
    private String orgName;

    public static OtpSendOnEmailRequest from(
            String doctorEmail, String otpNo, @Nullable Language language, @Nullable String orgName) {
        return OtpSendOnEmailRequest.builder()
                .email(doctorEmail)
                .otpNo(otpNo)
                .language(language)
                .orgName(orgName)
                .build();
    }
}
