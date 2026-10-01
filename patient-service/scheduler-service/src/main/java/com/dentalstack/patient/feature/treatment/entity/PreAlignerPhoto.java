package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.storage.dto.AddPreAlignerPhotoRequest;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "pre_aligner_photo")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreAlignerPhoto extends BaseEntity {
    @NotNull
    private String imageUrl;

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
    private boolean deleted;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aligner_journey_id")
    private AlignerJourney alignerJourney;

    public static PreAlignerPhoto from(
            AddPreAlignerPhotoRequest req, String imageUrl, String photoFilename, AlignerJourney alignerJourney) {
        return PreAlignerPhoto.builder()
                .imageUrl(imageUrl)
                .imageName(photoFilename)
                .description(req.getDescription())
                .uploaderUserType(req.getUserType())
                .uploadedBy(req.getUserId())
                .alignerJourney(alignerJourney)
                .build();
    }
}
