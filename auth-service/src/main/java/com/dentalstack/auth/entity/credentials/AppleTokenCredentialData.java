package com.dentalstack.auth.entity.credentials;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AppleTokenCredentialData extends CredentialData {

    private String appleToken;

    @JsonCreator
    public AppleTokenCredentialData(String appleToken) {
        super(CredentialType.APPLE_TOKEN);
        this.appleToken = appleToken;
    }
}
