package com.dentalstack.patient.feature.chat.entity;

import com.dentalstack.patient.feature.chat.enums.MessageType;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;

@Entity
@Table(
        name = "chat_message",
        indexes = {
            @Index(name = "IX_chat_message_chat_id", columnList = "chat_id"),
            @Index(name = "IX_chat_message_sender_id", columnList = "sender_profile_id"),
            @Index(name = "IX_chat_message_created_at", columnList = "created_at"),
            @Index(name = "IX_chat_message_type", columnList = "message_type"),
            @Index(name = "IX_chat_message_reply_to", columnList = "reply_to_message_id")
        })
@Getter
@Setter
@ToString(exclude = {"chat", "senderProfile", "replyToMessage", "files", "readReceipts", "alignerCheckIn"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private DoctorChat chat;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_profile_id", nullable = false)
    private UserProfile senderProfile;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private ZonedDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by_profile_id")
    private UserProfile deletedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_message_id")
    private ChatMessage replyToMessage;

    @Builder.Default
    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinTable(
            name = "chat_message_files",
            joinColumns = @JoinColumn(name = "chat_message_id"),
            inverseJoinColumns = @JoinColumn(name = "file_id"),
            indexes = {
                @Index(name = "IX_chat_message_files_message_id", columnList = "chat_message_id"),
                @Index(name = "IX_chat_message_files_file_id", columnList = "file_id")
            })
    private List<File> files = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MessageReadReceipt> readReceipts = new HashSet<>();

    @Column(name = "edited_at")
    private ZonedDateTime editedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isEdited = false;

    @OneToOne(mappedBy = "message", fetch = FetchType.LAZY)
    private AlignerCheckIn alignerCheckIn;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_organization")
    private String senderOrganization;
}
