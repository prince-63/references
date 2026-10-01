package com.dentalstack.patient.feature.storage.drive.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.*;

@Entity
@Table(name = "google_drive_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleDriveToken extends BaseEntity {

    private Long profileId;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "expiry_date")
    private Instant expiryDate;
}
