package com.dentalstack.patient.feature.treatmenttracking.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.treatmenttracking.enums.ReviewStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "aligner_review",
        indexes = {
            @Index(name = "IX_aligner_review_patient_id", columnList = "patient_id"),
            @Index(name = "IX_aligner_review_stage_id", columnList = "aligner_stage_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_stage_id")
    private AlignerStage alignerStage;

    private String fitFeedback;
    private String painFeedback;
    private String patientNote;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "aligner_review_photo_files",
            joinColumns = @JoinColumn(name = "aligner_review_id"),
            inverseJoinColumns = @JoinColumn(name = "file_id"))
    @Builder.Default
    @ToString.Exclude
    private List<File> photos = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus;
}
