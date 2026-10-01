package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.storage.dto.AddAlignerPhotoRequest;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(
        name = "aligner_photo",
        indexes = {@Index(name = "IX_aligner_photo_aligner_id", columnList = "aligner_id")})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerPhoto extends BaseEntity {
    @NotNull
    private String imageUrl;

    private boolean withAligner;

    @NotNull
    private String imageName;

    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType uploaderUserType;

    @NotNull
    private Long uploadedBy;

    @Enumerated(EnumType.STRING)
    private UserType deleterUserType;

    private Long deletedBy;

    @Builder.Default
    private boolean deleted = false;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aligner_id")
    private Aligner aligner;

    public static AlignerPhoto from(AddAlignerPhotoRequest req, String imageUrl, String imageName, Aligner aligner) {
        return AlignerPhoto.builder()
                .imageName(imageName)
                .withAligner(req.isWithAligner())
                .imageUrl(imageUrl)
                .description(req.getDescription())
                .uploaderUserType(req.getUserType())
                .uploadedBy(req.getUserId())
                .deleted(false)
                .aligner(aligner)
                .build();
    }

    public static AlignerPhoto fromPatient(
            long patientId, String imageUrl, String imageName, Aligner aligner, boolean withAligner) {
        return AlignerPhoto.builder()
                .imageName(imageName)
                .withAligner(withAligner)
                .imageUrl(imageUrl)
                .uploaderUserType(UserType.PATIENT)
                .uploadedBy(patientId)
                .deleted(false)
                .aligner(aligner)
                .build();
    }
}
