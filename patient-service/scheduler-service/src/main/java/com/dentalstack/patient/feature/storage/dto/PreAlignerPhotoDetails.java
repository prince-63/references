package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.feature.treatment.entity.PreAlignerPhoto;
import com.dentalstack.patient.global.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreAlignerPhotoDetails {
    private String imageUrl;
    private String imageName;
    private String description;

    private UserType uploaderUserType;
    private Long uploadedBy;

    private UserType deleterUserType;
    private Long deletedBy;
    private boolean deleted;

    public static PreAlignerPhotoDetails from(PreAlignerPhoto preAlignerPhoto) {
        return PreAlignerPhotoDetails.builder()
                .imageName(preAlignerPhoto.getImageName())
                .imageUrl(preAlignerPhoto.getImageUrl())
                .description(preAlignerPhoto.getDescription())
                .uploaderUserType(preAlignerPhoto.getUploaderUserType())
                .uploadedBy(preAlignerPhoto.getUploadedBy())
                .deletedBy((preAlignerPhoto.getDeletedBy()))
                .deleterUserType(preAlignerPhoto.getDeleterUserType())
                .deleted(preAlignerPhoto.isDeleted())
                .build();
    }
}
