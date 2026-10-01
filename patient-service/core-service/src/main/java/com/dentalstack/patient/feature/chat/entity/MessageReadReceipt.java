package com.dentalstack.patient.feature.chat.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import lombok.*;

@Entity
@Table(
        name = "message_read_receipt",
        indexes = {
            @Index(name = "IX_read_receipt_message_id", columnList = "message_id"),
            @Index(name = "IX_read_receipt_user_profile_id", columnList = "user_profile_id"),
            @Index(name = "UX_read_receipt_message_user", columnList = "message_id, user_profile_id", unique = true)
        })
@Getter
@Setter
@ToString(exclude = {"message", "userProfile"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReadReceipt extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @NotNull
    @Column(name = "read_at", nullable = false)
    @Builder.Default
    private ZonedDateTime readAt = ZonedDateTime.now();
}
