package com.dentalstack.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "login_attempt")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class LoginAttempt extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private AttemptStatus status;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "auth_id")
    private Auth auth;

    public static LoginAttempt newAttempt(Auth auth) {
        return new LoginAttempt(AttemptStatus.IN_PROGRESS, auth);
    }

    public enum AttemptStatus {
        PASSED,
        IN_PROGRESS,
        FAILED
    }
}
