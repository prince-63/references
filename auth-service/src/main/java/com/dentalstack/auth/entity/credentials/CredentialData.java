package com.dentalstack.auth.entity.credentials;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = PasswordCredentialData.class, name = "PASSWORD"),
    @JsonSubTypes.Type(value = GoogleTokenCredentialData.class, name = "GOOGLE_TOKEN"),
    @JsonSubTypes.Type(value = AppleTokenCredentialData.class, name = "APPLE_TOKEN")
})
@AllArgsConstructor
@Data
public abstract class CredentialData implements Serializable {
    private final CredentialType type;

    public enum CredentialType {
        PASSWORD,
        GOOGLE_TOKEN,
        APPLE_TOKEN
    }
}
