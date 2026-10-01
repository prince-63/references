package com.dentalstack.patient.feature.chat.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "aligner_check_in",
        indexes = {
            @Index(name = "IX_aligner_check_in_patient_id", columnList = "patient_id"),
            @Index(name = "IX_aligner_check_in_chat_id", columnList = "chat_id"),
            @Index(name = "IX_aligner_check_in_message_id", columnList = "message_id"),
            @Index(name = "IX_aligner_check_in_created_at", columnList = "created_at")
        })
@Getter
@Setter
@ToString(exclude = {"patient", "chat", "message", "submittedBy", "files"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerCheckIn extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private DoctorChat chat;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private ChatMessage message;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_profile_id", nullable = false)
    private UserProfile submittedBy;

    @Column(name = "aligner_number", nullable = false)
    private Integer alignerNumber;

    @Column(name = "start_aligner_number")
    private Integer startAlignerNumber;

    @Column(name = "end_aligner_number")
    private Integer endAlignerNumber;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "check_in_date", nullable = false)
    @Builder.Default
    private ZonedDateTime checkInDate = ZonedDateTime.now();

    @Builder.Default
    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinTable(
            name = "aligner_check_in_files",
            joinColumns = @JoinColumn(name = "aligner_check_in_id"),
            inverseJoinColumns = @JoinColumn(name = "file_id"),
            indexes = {
                @Index(name = "IX_aligner_check_in_files_check_in_id", columnList = "aligner_check_in_id"),
                @Index(name = "IX_aligner_check_in_files_file_id", columnList = "file_id")
            })
    private List<File> files = new ArrayList<>();

    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @Column(name = "total_aligners")
    private Integer totalAligners;

    public void addFile(File file) {
        files.add(file);
    }

    public void removeFile(File file) {
        files.remove(file);
    }

    public void clearFiles() {
        files.clear();
    }
}
