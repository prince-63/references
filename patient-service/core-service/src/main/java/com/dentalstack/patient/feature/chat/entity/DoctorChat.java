package com.dentalstack.patient.feature.chat.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(
        name = "doctor_chat",
        indexes = {
            @Index(name = "IX_doctor_chat_patient_id", columnList = "patient_id"),
            @Index(name = "IX_doctor_chat_created_at", columnList = "created_at")
        })
@Getter
@Setter
@ToString(exclude = {"patient", "participants", "messages", "caseTeams"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorChat extends BaseEntity {

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull
    @Column(nullable = false)
    private String chatName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChatParticipant> participants = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChatMessage> messages = new HashSet<>();

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "doctor_chat_case_team",
            joinColumns = @JoinColumn(name = "chat_id"),
            inverseJoinColumns = @JoinColumn(name = "case_team_id"))
    private Set<CaseTeam> caseTeams = new HashSet<>();

    @Column(name = "last_message_at")
    private java.time.ZonedDateTime lastMessageAt;

    @Column(name = "unread_count")
    @Builder.Default
    private Integer unreadCount = 0;
}
