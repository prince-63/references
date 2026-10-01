package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlignerPhotosByAlignerResponse {
    private int alignerSrNo;
    private JawType jawType;
    private List<PhotoDetail> photos;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhotoDetail {
        private Long photoId;
        private String imageName;
        private boolean withAligner;
        private String imageUrl;
        private String description;
        private UserType uploaderUserType;
        private Long uploadedBy;
    }
}
