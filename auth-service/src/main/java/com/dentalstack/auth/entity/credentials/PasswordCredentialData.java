package com.dentalstack.auth.entity.credentials;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PasswordCredentialData extends CredentialData {
    private String password;

    @JsonCreator
    public PasswordCredentialData(String password) {
        super(CredentialType.PASSWORD);
        this.password = password;
    }
}
