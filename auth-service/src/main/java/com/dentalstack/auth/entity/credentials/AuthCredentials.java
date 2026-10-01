package com.dentalstack.auth.entity.credentials;

import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.entity.BaseEntity;
import com.dentalstack.auth.enums.auth.credentials.CredentialStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "auth_credentials")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AuthCredentials extends BaseEntity {
    @NotNull
    @ManyToOne
    @JoinColumn(name = "auth_id")
    private Auth auth;

    @Enumerated(EnumType.STRING)
    private CredentialType type;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private CredentialData credentialData;

    @Enumerated(EnumType.STRING)
    private CredentialStatus status;

    public static AuthCredentials newGoogleCredentials(String googleToken, Auth auth) {
        return AuthCredentials.builder()
                .type(CredentialType.GOOGLE_TOKEN)
                .auth(auth)
                .credentialData(new GoogleTokenCredentialData(googleToken))
                .status(CredentialStatus.INACTIVE)
                .build();
    }

    public static AuthCredentials newAppleCredentials(String googleToken, Auth auth) {
        return AuthCredentials.builder()
                .type(CredentialType.APPLE_TOKEN)
                .auth(auth)
                .credentialData(new AppleTokenCredentialData(googleToken))
                .status(CredentialStatus.INACTIVE)
                .build();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        AuthCredentials that = (AuthCredentials) o;
        return Objects.equals(auth, that.auth) && type == that.type;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), auth, type);
    }

    public static AuthCredentials newPasswordCredentials(String password, Auth auth) {
        return AuthCredentials.builder()
                .type(CredentialType.PASSWORD)
                .auth(auth)
                .credentialData(new PasswordCredentialData(password))
                .status(CredentialStatus.INACTIVE)
                .build();
    }

    public static AuthCredentials newPasswordCredential(String password, Auth auth) {
        return AuthCredentials.builder()
                .type(CredentialType.PASSWORD)
                .auth(auth)
                .credentialData(new PasswordCredentialData(password))
                .status(CredentialStatus.ACTIVE)
                .build();
    }

    public void update(AuthCredentials credentials) {
        this.type = credentials.getType();
        this.credentialData = credentials.getCredentialData();
        this.status = credentials.getStatus();
    }
}
