package com.dentalstack.patient.feature.auth.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateAuthRequest {

    private String email;

    private String uuid;

    public static UpdateAuthRequest from(String email, String uuid) {
        return new UpdateAuthRequest(email, uuid);
    }
}
