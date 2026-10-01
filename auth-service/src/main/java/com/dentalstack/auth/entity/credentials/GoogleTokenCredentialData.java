package com.dentalstack.auth.entity.credentials;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class GoogleTokenCredentialData extends CredentialData {
    private String googleToken;

    @JsonCreator
    public GoogleTokenCredentialData(String googleToken) {
        super(CredentialType.GOOGLE_TOKEN);
        this.googleToken = googleToken;
    }
}
