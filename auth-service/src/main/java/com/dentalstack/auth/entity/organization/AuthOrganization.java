package com.dentalstack.auth.entity.organization;

import com.dentalstack.auth.entity.BaseEntity;
import jakarta.persistence.*;
import java.security.SecureRandom;
import java.util.Base64;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "auth_organization",
        indexes = {
            @Index(name = "UX_auth_organization_name", unique = true, columnList = "name"),
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AuthOrganization extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String token;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "requests_per_minute", nullable = false)
    private int requestsPerMinute;

    public static String generateSecureToken(int length) {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[length];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
