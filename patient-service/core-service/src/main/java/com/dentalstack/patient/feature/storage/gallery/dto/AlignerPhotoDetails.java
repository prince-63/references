package com.dentalstack.patient.feature.storage.gallery.dto;

import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.storage.files.enums.FileType;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.io.FilenameUtils;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerPhotoDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long alignerPhotoId;
    private Long alignerJourneyId;
    private Integer alignerNo;

    private Boolean isGDrivePlatform;
    private String imageUrl;
    private boolean withAligner;
    private String imageName;
    private String description;

    private UserType uploaderUserType;
    private Long uploadedBy;

    private UserType deleterUserType;
    private Long deletedBy;

    private boolean deleted;

    private JawType jawType;

    private FileType fileType;

    public static AlignerPhotoDetails from(AlignerPhoto alignerPhoto) {
        Integer currentAlignerNo = null;
        JawType jawType = null;
        if (alignerPhoto.getAligner() != null)
            currentAlignerNo = alignerPhoto.getAligner().getSrNo();

        Long alignerJourneyId = null;
        if (alignerPhoto.getAligner() != null && alignerPhoto.getAligner().getAlignerJourney() != null) {
            alignerJourneyId = alignerPhoto.getAligner().getAlignerJourney().getId();
            jawType = alignerPhoto.getAligner().getJawType();
        }
        var extension = FilenameUtils.getExtension(alignerPhoto.getImageName()).toLowerCase();
        return AlignerPhotoDetails.builder()
                .alignerPhotoId(alignerPhoto.getId())
                .alignerJourneyId(alignerJourneyId)
                .imageUrl(alignerPhoto.getImageUrl())
                .isGDrivePlatform(alignerPhoto.getIsGDrivePlatform())
                .withAligner(alignerPhoto.isWithAligner())
                .imageName(alignerPhoto.getImageName())
                .description(alignerPhoto.getDescription())
                .uploaderUserType(alignerPhoto.getUploaderUserType())
                .uploadedBy(alignerPhoto.getUploadedBy())
                .deleterUserType(alignerPhoto.getDeleterUserType())
                .deletedBy(alignerPhoto.getDeletedBy())
                .deleted(alignerPhoto.isDeleted())
                .jawType(jawType)
                .alignerNo(currentAlignerNo)
                .fileType(FileType.fromExtension(extension))
                .build();
    }
}
