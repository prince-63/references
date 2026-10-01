package com.dentalstack.auth.entity;

import com.dentalstack.auth.dto.JWTToken;
import com.dentalstack.auth.entity.authstage.AuthStage;
import com.dentalstack.auth.entity.credentials.AuthCredentials;
import com.dentalstack.auth.enums.auth.AuthStageStatus;
import com.dentalstack.auth.enums.auth.AuthStageType;
import com.dentalstack.auth.enums.auth.AuthStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.enums.doctor.DoctorRole;
import com.dentalstack.auth.enums.doctor.UserRegistrationType;
import com.dentalstack.auth.enums.patient.UserType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "auth",
        indexes = {
            @Index(
                    name = "UX_auth_email_org_id_and_platfrom_name",
                    unique = true,
                    columnList = "email,organizationId,xOrganizationName"),
            @Index(name = "UX_auth_user_id", unique = true, columnList = "userId")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class Auth extends BaseEntity {
    private Long userId;

    @Enumerated(EnumType.STRING)
    private UserType userType;

    private String email;
    private String mobileNo;

    private String countryCode;

    @Column(name = "token", columnDefinition = "TEXT")
    private String token;

    private ZonedDateTime tokenExpireAt;

    @OneToMany(mappedBy = "auth", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<AuthCredentials> credentials = new HashSet<>();

    @OneToMany(mappedBy = "auth", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<AuthStage> stages = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private AuthStatus status;

    @Nullable
    private ZonedDateTime blockedTill;

    private String uuid;

    private Boolean userConsent;

    private String firstName;

    private String lastName;
    private String salutation;

    @OneToMany(mappedBy = "auth", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<LoginAttempt> loginAttempts = new ArrayList<>();

    @OneToMany(mappedBy = "auth", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<DeviceInfo> devices = new ArrayList<>();

    private String brandName;

    @Nullable
    @Enumerated(EnumType.STRING)
    private DoctorRole doctorRole;

    @Nullable
    @Enumerated(EnumType.STRING)
    private UserRegistrationType userRegistrationType;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "sso_token", columnDefinition = "TEXT")
    private String ssoToken;

    private String xOrganizationName;

    private Long organizationId;

    public static Auth newPasswordSignup(
            String email,
            String password,
            UserType userType,
            boolean userConsent,
            Long organizationId,
            String xOrganizationName) {
        var auth = Auth.builder()
                .email(email)
                .userType(userType)
                .status(AuthStatus.IN_PROGRESS)
                .userConsent(userConsent)
                .organizationId(organizationId)
                .xOrganizationName(xOrganizationName)
                .build();

        var credentials = AuthCredentials.newPasswordCredentials(password, auth);
        auth.addOrReplaceCredentials(credentials);

        return auth;
    }

    public static Auth newPasswordSignup(String email, String password, UserType userType, boolean userConsent) {
        var auth = Auth.builder()
                .email(email)
                .userType(userType)
                .status(AuthStatus.IN_PROGRESS)
                .userConsent(userConsent)
                .build();

        var credentials = AuthCredentials.newPasswordCredentials(password, auth);
        auth.addOrReplaceCredentials(credentials);

        return auth;
    }

    public static Auth newGoogleSignup(
            String email, String googleToken, UserType userType, Long organizationId, String xOrganizationName) {
        var auth = Auth.builder()
                .email(email)
                .userType(userType)
                .status(AuthStatus.IN_PROGRESS)
                .organizationId(organizationId)
                .xOrganizationName(xOrganizationName)
                .build();

        var credentials = AuthCredentials.newGoogleCredentials(googleToken, auth);
        auth.addOrReplaceCredentials(credentials);

        return auth;
    }

    public static Auth newGoogleSignup(String email, String googleToken, UserType userType) {
        var auth = Auth.builder()
                .email(email)
                .userType(userType)
                .status(AuthStatus.IN_PROGRESS)
                .build();

        var credentials = AuthCredentials.newGoogleCredentials(googleToken, auth);
        auth.addOrReplaceCredentials(credentials);

        return auth;
    }

    public static Auth newAppleSignup(
            String email, String appleToken, UserType userType, Long organizationId, String xOrganizationName) {
        var auth = Auth.builder()
                .email(email)
                .userType(userType)
                .status(AuthStatus.IN_PROGRESS)
                .organizationId(organizationId)
                .xOrganizationName(xOrganizationName)
                .build();

        var credentials = AuthCredentials.newAppleCredentials(appleToken, auth);
        auth.addOrReplaceCredentials(credentials);

        return auth;
    }

    public static Auth newAppleSignup(String email, String appleToken, UserType userType) {
        var auth = Auth.builder()
                .email(email)
                .userType(userType)
                .status(AuthStatus.IN_PROGRESS)
                .build();

        var credentials = AuthCredentials.newAppleCredentials(appleToken, auth);
        auth.addOrReplaceCredentials(credentials);

        return auth;
    }

    private void addOrReplaceCredentials(AuthCredentials credentials) {
        boolean found = false;
        for (var c : this.getCredentials()) {
            if (c.getType().equals(credentials.getType())) {
                c.update(credentials);
                found = true;
                break;
            }
        }

        if (!found) {
            getCredentials().add(credentials);
        }
    }

    public void addOrReplace(AuthStage stage) {
        boolean found = false;
        for (var s : stages) {
            if (s.getStageType().equals(stage.getStageType())) {
                s.update(stage);
                found = true;
                break;
            }
        }

        if (!found) {
            stages.add(stage);
        }
    }

    public void addOrReplace(AuthCredentials authCredentials) {
        boolean found = false;
        for (var c : credentials) {
            if (c.getType().equals(authCredentials.getType())) {
                c.update(authCredentials);
                found = true;
                break;
            }
        }

        if (!found) {
            credentials.add(authCredentials);
        }
    }

    public Optional<AuthStage> getStage(AuthStageType authStageType, AuthStageStatus status) {
        return this.stages.stream()
                .filter(stage -> stage.getStageType().equals(authStageType)
                        && stage.getStatus().equals(status))
                .findAny();
    }

    public Optional<AuthStage> getStage(AuthStageType authStageType) {
        return this.stages.stream()
                .filter(stage -> stage.getStageType().equals(authStageType))
                .findAny();
    }

    public void changeStageStatus(AuthStageType stageType, AuthStageStatus status) {
        getStages().stream()
                .filter(stage -> stage.getStageType().equals(stageType))
                .forEach(stage -> {
                    stage.setStatus(status);
                });
    }

    public void updateToken(JWTToken token) {
        this.token = token.getToken();
        this.tokenExpireAt = token.getExpireAt();
    }

    public void changeCredentialStatus(CredentialType credentialType, CredentialStatus status) {
        getCredentials().stream()
                .filter(cred -> cred.getType().equals(credentialType))
                .forEach(credentials -> {
                    credentials.setStatus(status);
                });
    }

    public Optional<AuthCredentials> getCredential(CredentialType credentialType, CredentialStatus status) {
        return getCredentials().stream()
                .filter(credentials -> credentials.getStatus().equals(status)
                        && credentials.getType().equals(credentialType))
                .findAny();
    }

    public Optional<AuthCredentials> getCredential(CredentialType credentialType) {
        return getCredentials().stream()
                .filter(credentials -> credentials.getType().equals(credentialType))
                .findAny();
    }

    public void invalidateToken() {
        this.token = null;
        this.tokenExpireAt = ZonedDateTime.now();
    }

    public boolean isTokenValid() {
        boolean hasToken = token != null;
        boolean hasExpiry = tokenExpireAt != null;
        boolean notExpired = tokenExpireAt != null && tokenExpireAt.isAfter(ZonedDateTime.now());

        return hasToken && hasExpiry && notExpired;
    }

    public void addDevice(DeviceInfo deviceInfo) {
        devices.add(deviceInfo);
        deviceInfo.setAuth(this);
    }

    public void updateSsoToken(JWTToken ssoToken) {
        if (this.ssoToken == null) {
            this.ssoToken = ssoToken.getToken();
        }
    }
}
