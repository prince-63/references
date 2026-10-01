package com.dentalstack.patient.feature.chat.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import lombok.*;

@Entity
@Table(
        name = "chat_participant",
        indexes = {
            @Index(name = "IX_chat_participant_chat_id", columnList = "chat_id"),
            @Index(name = "IX_chat_participant_user_profile_id", columnList = "user_profile_id"),
            @Index(name = "UX_chat_participant_chat_user", columnList = "chat_id, user_profile_id", unique = true)
        })
@Getter
@Setter
@ToString(exclude = {"chat", "userProfile"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatParticipant extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private DoctorChat chat;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @Column(name = "last_read_at")
    private ZonedDateTime lastReadAt;

    @Column(name = "joined_at")
    @Builder.Default
    private ZonedDateTime joinedAt = ZonedDateTime.now();

    @Column(name = "is_online")
    @Builder.Default
    private Boolean isOnline = false;

    @Column(name = "last_seen_at")
    private ZonedDateTime lastSeenAt;

    @Column(name = "is_typing")
    @Builder.Default
    private Boolean isTyping = false;

    @Column(name = "typing_updated_at")
    private ZonedDateTime typingUpdatedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "unread_count")
    @Builder.Default
    private Integer unreadCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_profile_id")
    private UserProfile addedBy;

    @Column(name = "added_via_case_team_id")
    private Long addedViaCaseTeamId;
}
