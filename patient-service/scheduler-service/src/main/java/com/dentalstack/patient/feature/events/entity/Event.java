package com.dentalstack.patient.feature.events.entity;

import com.dentalstack.patient.feature.doctor.entity.organization.Organization;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
        name = "event",
        indexes = {
            @Index(name = "IX_event_user_id", columnList = "userId"),
            @Index(name = "IX_event_user_id_user_type", columnList = "userId, userType"),
            @Index(name = "IX_event_for_user_id_user_type", columnList = "forUserId, userType"),
            @Index(name = "IX_event_for_user_id_user_type_status", columnList = "userId, userType, active"),
            @Index(name = "IX_event_for_user_id_for_user_type_status", columnList = "forUserId, forUserType, active"),
            @Index(name = "IX_event_type", columnList = "type")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event extends BaseEntity {
    @NotNull
    private Long userId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType userType;

    @NotNull
    private Long forUserId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType forUserType;

    @NotNull
    private LocalDateTime eventTime;

    @NotNull
    @Enumerated(EnumType.STRING)
    private EventType type;

    @NotNull
    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private EventMetadata metadata;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean read = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;
}
