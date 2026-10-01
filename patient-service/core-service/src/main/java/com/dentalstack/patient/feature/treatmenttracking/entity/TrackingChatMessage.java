package com.dentalstack.patient.feature.treatmenttracking.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.treatmenttracking.enums.ChatEventType;
import com.dentalstack.patient.feature.treatmenttracking.enums.SenderType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "tracking_chat_message",
        indexes = {
            @Index(name = "IX_tracking_chat_message_patient_id", columnList = "patient_id"),
            @Index(name = "IX_tracking_chat_message_sender", columnList = "senderType, senderId")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingChatMessage extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @NotNull
    @Enumerated(EnumType.STRING)
    private SenderType senderType;

    private Long senderId;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private ChatEventType eventType;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "tracking_chat_message_attachments",
            joinColumns = @JoinColumn(name = "tracking_chat_message_id"),
            inverseJoinColumns = @JoinColumn(name = "file_id"))
    @Builder.Default
    @ToString.Exclude
    private List<File> attachments = new ArrayList<>();

    private Boolean isRead;

    private ZonedDateTime readAt;
}
